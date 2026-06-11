import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async create(createPrescriptionDto: CreatePrescriptionDto, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    return this.prisma.prescription.create({
      data: {
        tenantId,
        patientId: createPrescriptionDto.patientId,
        medicalRecordId: createPrescriptionDto.medicalRecordId,
        notes: createPrescriptionDto.notes,
        items: {
          create: createPrescriptionDto.items.map((item) => ({
            medicineName: item.medicineName,
            dosage: item.dosage,
            duration: item.duration,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findAll(tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    return this.prisma.prescription.findMany({
      where: {
        tenantId,
      },
      include: {
        items: true,
        patient: {
          select: { fullName: true }
        },
        medicalRecord: {
          select: { diagnosis: true }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllByPatient(patientId: string, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    return this.prisma.prescription.findMany({
      where: {
        tenantId,
        patientId,
      },
      include: {
        items: true,
        patient: true,
        medicalRecord: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        items: true,
        patient: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async remove(id: string, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    // First verify it exists and belongs to the tenant
    const existing = await this.prisma.prescription.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException(`Prescription not found`);
    }

    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
