"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
const client_1 = require("@prisma/client");
let BillingService = class BillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async create(dto, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const subtotal = dto.items.reduce((sum, item) => sum + Number(item.amount), 0);
        const discount = Number(dto.discount ?? 0);
        const tax = Number(dto.tax ?? 0);
        const finalAmount = subtotal - discount + tax;
        if (finalAmount < 0) {
            throw new common_1.BadRequestException('الخصم لا يمكن أن يتجاوز المبلغ الإجمالي');
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
                status: client_1.InvoiceStatus.UNPAID,
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
    async findOne(id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, tenantId: this.tenantId },
            include: {
                items: true,
                patient: { select: { id: true, fullName: true, fileNumber: true, phone: true } },
                appointment: { select: { id: true, appointmentDate: true } },
                payments: { orderBy: { paymentDate: 'desc' } },
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('الفاتورة غير موجودة');
        return invoice;
    }
    async findByPatient(patientId) {
        return this.prisma.invoice.findMany({
            where: { patientId, tenantId: this.tenantId },
            include: { items: true, payments: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async recordPayment(invoiceId, dto) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('هذه الفاتورة مدفوعة بالكامل بالفعل');
        }
        if (invoice.status === client_1.InvoiceStatus.CANCELLED) {
            throw new common_1.BadRequestException('لا يمكن تسجيل دفعة على فاتورة ملغاة');
        }
        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(invoice.finalAmount) - totalPaid;
        if (Number(dto.amount) > remaining + 0.01) {
            throw new common_1.BadRequestException(`المبلغ المدفوع (${dto.amount}) يتجاوز المبلغ المتبقي (${remaining.toFixed(2)})`);
        }
        await this.prisma.payment.create({
            data: {
                tenantId: this.tenantId,
                invoiceId,
                amount: dto.amount,
                paymentMethod: dto.paymentMethod,
                notes: dto.notes,
            },
        });
        const newTotalPaid = totalPaid + Number(dto.amount);
        let newStatus;
        if (newTotalPaid >= Number(invoice.finalAmount) - 0.01) {
            newStatus = client_1.InvoiceStatus.PAID;
        }
        else {
            newStatus = client_1.InvoiceStatus.PARTIALLY_PAID;
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
    async cancel(id) {
        const invoice = await this.findOne(id);
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('لا يمكن إلغاء فاتورة مدفوعة بالكامل');
        }
        return this.prisma.invoice.update({
            where: { id },
            data: { status: client_1.InvoiceStatus.CANCELLED },
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
                where: { tenantId, status: client_1.InvoiceStatus.PAID },
                _sum: { finalAmount: true },
                _count: true,
            }),
            this.prisma.invoice.aggregate({
                where: { tenantId, status: client_1.InvoiceStatus.UNPAID },
                _sum: { finalAmount: true },
                _count: true,
            }),
            this.prisma.invoice.aggregate({
                where: { tenantId, status: client_1.InvoiceStatus.PARTIALLY_PAID },
                _sum: { finalAmount: true },
                _count: true,
            }),
        ]);
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map