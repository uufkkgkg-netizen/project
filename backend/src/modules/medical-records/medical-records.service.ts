import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async create(createDto: CreateMedicalRecordDto, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    
    // 1. Verify Patient belongs to the tenant
    const patient = await this.prisma.patient.findFirst({
      where: { id: createDto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // 2. Create the Medical Record (transaction to handle prescription as well)
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.medicalRecord.create({
        data: {
          tenantId,
          patientId: createDto.patientId,
          appointmentId: createDto.appointmentId,
          chiefComplaint: createDto.chiefComplaint,
          diagnosis: createDto.diagnosis,
          vitals: createDto.vitals ? createDto.vitals : undefined,
          notes: createDto.notes,
        },
      });

      // 3. Create Prescription and Items if provided
      if (createDto.prescriptionItems && createDto.prescriptionItems.length > 0) {
        await tx.prescription.create({
          data: {
            tenantId,
            patientId: createDto.patientId,
            medicalRecordId: record.id,
            notes: createDto.prescriptionNotes,
            items: {
              create: createDto.prescriptionItems.map(item => ({
                medicineName: item.medicineName,
                dosage: item.dosage,
                duration: item.duration,
              })),
            },
          },
        });
      }

      return tx.medicalRecord.findFirst({
        where: { id: record.id, tenantId },
        include: {
          prescription: {
            include: { items: true },
          },
          patient: true,
        },
      });
    });
  }

  async findAllByPatient(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId, tenantId: this.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        prescription: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, tenantId: this.tenantId },
      include: {
        prescription: {
          include: { items: true },
        },
        patient: true,
      },
    });
    if (!record) throw new NotFoundException('Medical Record not found');
    return record;
  }
}
