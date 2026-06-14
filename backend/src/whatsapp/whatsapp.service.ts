import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private prisma: PrismaService) {}

  // Runs every hour to find appointments in exactly 24 hours
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Running WhatsApp Reminder Cron Job...');
    
    // Calculate 24 hours from now
    const now = new Date();
    const targetStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const targetEnd = new Date(targetStart.getTime() + 60 * 60 * 1000);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: targetStart,
          lt: targetEnd,
        },
        status: 'PENDING',
      },
      include: {
        patient: true,
      },
    });

    this.logger.debug(`Found ${upcomingAppointments.length} appointments for reminder.`);

    for (const appt of upcomingAppointments) {
      if (!appt.patient.phone) continue;

      let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';
      let errorMessage: string | null = null;

      try {
        // Here we would integrate with actual WhatsApp API like Twilio or Meta Graph API.
        // For demonstration, 90% success rate:
        const isSuccess = Math.random() > 0.1;
        if (isSuccess) {
          status = 'SUCCESS';
        } else {
          status = 'FAILED';
          errorMessage = 'WhatsApp API Timeout';
        }
      } catch (err: any) {
        status = 'FAILED';
        errorMessage = err.message || 'Unknown error';
      }

      await this.prisma.whatsappLog.create({
        data: {
          tenantId: appt.tenantId,
          patientName: appt.patient.fullName,
          patientPhone: appt.patient.phone,
          appointmentDate: appt.appointmentDate,
          status,
          errorMessage,
        },
      });
    }
  }

  async getLogs(tenantId: string) {
    return this.prisma.whatsappLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
