import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  private getStore() {
    const store = TenantContext.getStore();
    return {
      tenantId:     store?.tenantId     ?? null,
      userId:       store?.userId       ?? null,
      isSuperAdmin: store?.isSuperAdmin ?? false,
    };
  }

  // --- PATIENTS CRUD ---

  async create(createPatientDto: CreatePatientDto) {
    const { tenantId, isSuperAdmin } = this.getStore();

    if (!tenantId && !isSuperAdmin) {
      throw new ForbiddenException('لا يمكن إنشاء مريض بدون عيادة محددة');
    }

    const db = this.prisma as any;
    return db.patient.create({
      data: {
        ...createPatientDto,
        dateOfBirth: createPatientDto.dateOfBirth
          ? new Date(createPatientDto.dateOfBirth)
          : null,
        tenantId: tenantId!,
      },
    });
  }

  async findAll() {
    const db = this.prisma.scoped as any;
    return db.patient.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileNumber: true,
        fullName: true,
        phone: true,
        bloodType: true,
        createdAt: true,
      }
    });
  }

  async findOne(id: string) {
    const db = this.prisma.scoped as any;
    const patient = await db.patient.findFirst({
      where: { id },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          include: {
            doctor: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
    if (!patient) throw new NotFoundException('المريض غير موجود');
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    // Check existence and isolation
    await this.findOne(id);
    const db = this.prisma.scoped as any;
    
    const data: any = { ...updatePatientDto };
    if (updatePatientDto.dateOfBirth) {
      data.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
    }
    
    return db.patient.update({
      where: { id },
      data,
    });
  }

  // --- VISITS CRUD ---

  async createVisit(patientId: string, createVisitDto: CreateVisitDto) {
    // Verify patient exists and belongs to tenant
    await this.findOne(patientId);
    
    const { tenantId, userId } = this.getStore();
    const db = this.prisma as any;

    return db.visit.create({
      data: {
        ...createVisitDto,
        patientId,
        tenantId: tenantId!,
        doctorId: userId,
      }
    });
  }
}
