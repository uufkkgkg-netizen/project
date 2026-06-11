import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async create(createAppointmentDto: CreateAppointmentDto, tenantIdParam?: string) {
    const tenantId = tenantIdParam || this.tenantId;
    
    await this.validateDoctorExists(createAppointmentDto.doctorId, tenantId);
    await this.validateNoOverlap(createAppointmentDto.doctorId, new Date(createAppointmentDto.appointmentDate), createAppointmentDto.durationMinutes || 30, null, tenantId);

    return this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        durationMinutes: createAppointmentDto.durationMinutes || 30,
        tenantId,
      },
    });
  }

  async findAll(userRole: string, userId: string) {
    // If the user is a DOCTOR, only return their appointments.
    // If RECEPTIONIST/TENANT_ADMIN, return all tenant appointments.
    
    const whereClause: any = { tenantId: this.tenantId };
    
    if (userRole === 'DOCTOR') {
      whereClause.doctorId = userId;
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      orderBy: [{ appointmentDate: 'asc' }],
      include: {
        patient: {
          select: { id: true, fullName: true, fileNumber: true, phone: true }
        },
        doctor: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
    });
  }

  async findOne(id: string, userRole: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId: this.tenantId },
      include: { 
        patient: { select: { id: true, fullName: true, fileNumber: true, phone: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } }
      },
    });
    
    if (!appointment) throw new NotFoundException('Appointment not found');
    
    if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, userRole: string, userId: string) {
    const appointment = await this.findOne(id, userRole, userId);

    // If updating date/time or duration, check overlap
    if (updateAppointmentDto.appointmentDate || updateAppointmentDto.durationMinutes) {
      const newDate = updateAppointmentDto.appointmentDate ? new Date(updateAppointmentDto.appointmentDate) : appointment.appointmentDate;
      const newDuration = updateAppointmentDto.durationMinutes || appointment.durationMinutes;
      const doctorId = updateAppointmentDto.doctorId || appointment.doctorId;

      if (updateAppointmentDto.doctorId) {
          await this.validateDoctorExists(updateAppointmentDto.doctorId, this.tenantId);
      }

      await this.validateNoOverlap(doctorId, newDate, newDuration, id, this.tenantId);
    }

    // Role-based status updates: Doctor can only change status to IN_PROGRESS or COMPLETED
    if (userRole === 'DOCTOR' && updateAppointmentDto.status) {
       if (!['IN_PROGRESS', 'COMPLETED'].includes(updateAppointmentDto.status)) {
           throw new ForbiddenException('Doctors can only mark appointments as IN_PROGRESS or COMPLETED');
       }
    }

    const dataToUpdate: any = { ...updateAppointmentDto };
    if (updateAppointmentDto.appointmentDate) {
      dataToUpdate.appointmentDate = new Date(updateAppointmentDto.appointmentDate);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string, userRole: string, userId: string) {
    await this.findOne(id, userRole, userId);
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // --- Private Helper Methods ---

  private async validateDoctorExists(doctorId: string, tenantId: string) {
    const doctor = await this.prisma.user.findFirst({
      where: { id: doctorId, tenantId, role: 'DOCTOR' }
    });
    if (!doctor) {
      throw new BadRequestException('Invalid doctor ID or the user is not a doctor');
    }
  }

  private async validateNoOverlap(doctorId: string, newStart: Date, durationMinutes: number, excludeAppointmentId: string | null, tenantId: string) {
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);
    
    // Get all appointments for this doctor on the same day to verify overlaps in memory
    // (since Prisma cannot do native datetime math with the duration column easily)
    const startOfDay = new Date(newStart);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(newStart);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { notIn: ['CANCELLED'] } // Cancelled appointments don't cause overlap
      }
    });

    for (const app of existingAppointments) {
      const appStart = new Date(app.appointmentDate);
      const appEnd = new Date(appStart.getTime() + app.durationMinutes * 60000);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (newStart < appEnd && newEnd > appStart) {
        throw new BadRequestException('هذا الموعد يتعارض مع موعد آخر محجوز لنفس الطبيب.'); // Overlap conflict
      }
    }
  }
}
