import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreateInvoiceDto } from './dto/create-billing.dto';
import { RecordPaymentDto } from './dto/update-billing.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async create(dto: CreateInvoiceDto, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;

    // Calculate totals
    const subtotal = dto.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const discount = Number(dto.discount ?? 0);
    const tax = Number(dto.tax ?? 0);
    const finalAmount = subtotal - discount + tax;

    if (finalAmount < 0) {
      throw new BadRequestException('الخصم لا يمكن أن يتجاوز المبلغ الإجمالي');
    }

    return this.prisma.invoice.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        medicalRecordId: dto.medicalRecordId,
        totalAmount: subtotal,
        discount,
        tax,
        finalAmount,
        notes: dto.notes,
        status: InvoiceStatus.UNPAID,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        patient: { select: { id: true, fullName: true, fileNumber: true, phone: true } },
        payments: true,
      },
    });
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        items: true,
        patient: { select: { id: true, fullName: true, fileNumber: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId: this.tenantId },
      include: {
        items: true,
        patient: { select: { id: true, fullName: true, fileNumber: true, phone: true } },
        appointment: { select: { id: true, appointmentDate: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    return invoice;
  }

  async findByPatient(patientId: string) {
    return this.prisma.invoice.findMany({
      where: { patientId, tenantId: this.tenantId },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordPayment(invoiceId: string, dto: RecordPaymentDto) {
    const invoice = await this.findOne(invoiceId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('هذه الفاتورة مدفوعة بالكامل بالفعل');
    }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('لا يمكن تسجيل دفعة على فاتورة ملغاة');
    }

    const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const remaining = Number(invoice.finalAmount) - totalPaid;

    if (Number(dto.amount) > remaining + 0.01) {
      throw new BadRequestException(
        `المبلغ المدفوع (${dto.amount}) يتجاوز المبلغ المتبقي (${remaining.toFixed(2)})`
      );
    }

    // Record the payment
    await this.prisma.payment.create({
      data: {
        tenantId: this.tenantId,
        invoiceId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });

    // Recalculate total paid and update invoice status
    const newTotalPaid = totalPaid + Number(dto.amount);
    let newStatus: InvoiceStatus;

    if (newTotalPaid >= Number(invoice.finalAmount) - 0.01) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
      include: {
        items: true,
        patient: { select: { id: true, fullName: true, fileNumber: true, phone: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });
  }

  async cancel(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('لا يمكن إلغاء فاتورة مدفوعة بالكامل');
    }
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
  }

  async getSummary() {
    const tenantId = this.tenantId;
    const [all, paid, unpaid, partial] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenantId },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.PAID },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.UNPAID },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.PARTIALLY_PAID },
        _sum: { finalAmount: true },
        _count: true,
      }),
    ]);

    // Sum of all actual payments received
    const paymentsSum = await this.prisma.payment.aggregate({
      where: { tenantId },
      _sum: { amount: true },
    });

    return {
      totalInvoiced: Number(all._sum.finalAmount ?? 0),
      totalInvoices: all._count,
      totalCollected: Number(paymentsSum._sum.amount ?? 0),
      paidCount: paid._count,
      unpaidAmount: Number(unpaid._sum.finalAmount ?? 0),
      unpaidCount: unpaid._count,
      partialCount: partial._count,
    };
  }
}
