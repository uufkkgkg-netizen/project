import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export class PatientLoginDto {
  phone: string;
  fileNumber: number;
}

@Injectable()
export class PatientPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: PatientLoginDto) {
    // Clean phone number (trim spaces, etc)
    const phoneStr = dto.phone.trim();
    const fileNum = Number(dto.fileNumber);

    const patient = await this.prisma.patient.findFirst({
      where: {
        phone: {
          contains: phoneStr,
        },
        fileNumber: fileNum,
      },
      include: {
        tenant: true
      }
    });

    if (!patient) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة، يرجى التأكد من رقم الهاتف ورقم الملف');
    }

    if (!patient.isActive) {
      throw new UnauthorizedException('عذراً، هذا الملف غير نشط، راجع إدارة العيادة');
    }

    // Generate token
    const payload = {
      sub: patient.id,
      patientId: patient.id,
      tenantId: patient.tenantId,
      role: 'PATIENT',
      fullName: patient.fullName,
      tenantName: patient.tenant.name
    };

    return {
      access_token: this.jwtService.sign(payload),
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        tenantName: patient.tenant.name
      }
    };
  }

  async getDashboardData(patientId: string) {
    // Get upcoming appointments, latest ultrasounds, latest prescriptions
    const now = new Date();
    
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        patientId,
        appointmentDate: { gte: now },
      },
      orderBy: { appointmentDate: 'asc' },
      take: 3,
      include: { doctor: { select: { firstName: true, lastName: true } } }
    });

    const pastAppointments = await this.prisma.appointment.findMany({
      where: {
        patientId,
        appointmentDate: { lt: now },
      },
      orderBy: { appointmentDate: 'desc' },
      take: 5,
      include: { doctor: { select: { firstName: true, lastName: true } } }
    });

    const ultrasounds = await this.prisma.ultrasoundReport.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      take: 5,
      include: { doctor: { select: { firstName: true, lastName: true } } }
    });

    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      upcomingAppointments,
      pastAppointments,
      ultrasounds,
      prescriptions
    };
  }
}
