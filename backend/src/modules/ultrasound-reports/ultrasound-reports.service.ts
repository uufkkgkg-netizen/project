import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreateUltrasoundReportDto } from './dto/create-ultrasound-report.dto';

@Injectable()
export class UltrasoundReportsService {
  constructor(private prisma: PrismaService) {}

  private getStore() {
    const store = TenantContext.getStore();
    return {
      tenantId: store?.tenantId ?? null,
      userId: store?.userId ?? null,
    };
  }

  // --- String Interpolation Engine ---
  async generateReportFromTemplate(templateId: string, patientId: string): Promise<string> {
    const db = this.prisma.scoped as any;
    
    const [template, patient] = await Promise.all([
      db.medicalTemplate.findUnique({ where: { id: templateId } }),
      db.patient.findUnique({ where: { id: patientId } })
    ]);

    if (!template) throw new NotFoundException('القالب غير موجود');
    if (!patient) throw new NotFoundException('المريضة غير موجودة');

    let content = template.content;

    // Calculate age if birthDate exists
    let age = 'غير مسجل';
    if (patient.dateOfBirth) {
      const diffMs = Date.now() - patient.dateOfBirth.getTime();
      const ageDt = new Date(diffMs); 
      age = Math.abs(ageDt.getUTCFullYear() - 1970).toString();
    }

    const todayDate = new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' });

    // Dynamic Variables Map
    const variables: Record<string, string> = {
      'patient_name': patient.fullName,
      'patient_phone': patient.phone || '—',
      'age': age,
      'file_number': patient.fileNumber.toString(),
      'blood_type': patient.bloodType || '—',
      'date': todayDate,
    };

    // Replace all occurrences of {{variable_name}} with fallback to "____"
    content = content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, p1) => {
      if (variables[p1]) {
        return variables[p1];
      }
      return '____'; // Fallback for undefined variables
    });

    return content;
  }

  async create(dto: CreateUltrasoundReportDto) {
    const { tenantId, userId } = this.getStore();
    const db = this.prisma as any;

    return db.ultrasoundReport.create({
      data: {
        tenantId: tenantId!,
        doctorId: userId,
        patientId: dto.patientId,
        templateId: dto.templateId,
        date: new Date(),
        findings: dto.findings,
        measurements: dto.measurements || {},
        status: 'FINALIZED',
        imageUrls: dto.imageUrls || [],
      }
    });
  }

  async findAll() {
    const db = this.prisma.scoped as any;
    return db.ultrasoundReport.findMany({
      orderBy: { date: 'desc' },
      include: {
        patient: { select: { fullName: true, fileNumber: true } },
        doctor: { select: { firstName: true, lastName: true } },
      }
    });
  }

  async findByPatient(patientId: string) {
    const db = this.prisma.scoped as any;
    return db.ultrasoundReport.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        doctor: { select: { firstName: true, lastName: true } },
        template: { select: { title: true } }
      }
    });
  }
}
