import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { NotificationType, NotificationStatus, AppointmentStatus } from '@prisma/client';

export class SendNotificationDto {
  patientId: string;
  type?: NotificationType;
  message: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  /**
   * Mock sending notification and logging it to the database
   */
  async sendNotification(dto: SendNotificationDto) {
    const tenantId = this.tenantId;

    if (!tenantId) {
      this.logger.warn('No tenantId found in context. Skipping notification.');
      return;
    }

    try {
      // 1. Log the notification as PENDING
      const log = await this.prisma.notificationLog.create({
        data: {
          tenantId,
          patientId: dto.patientId,
          type: dto.type || NotificationType.SMS,
          message: dto.message,
          status: NotificationStatus.PENDING,
        },
      });

      // 2. Mock external API call (e.g., Twilio)
      this.logger.log(`[MOCK] Sending ${log.type} to patient ${dto.patientId}: ${dto.message}`);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Mark as SENT
      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Successfully sent ${dto.type} notification to ${dto.patientId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  // Runs every hour at the top of the hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleUpcomingAppointmentsReminders() {
    this.logger.log('Running 24h appointment reminder cron job...');

    // Time window: exactly 24 hours from now, up to 25 hours from now
    // Since this runs every hour, we look for appointments occurring between +24h and +25h
    const now = new Date();
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    try {
      const upcomingAppointments = await this.prisma.appointment.findMany({
        where: {
          appointmentDate: {
            gte: tomorrowStart,
            lt: tomorrowEnd,
          },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
        },
        include: {
          patient: true,
          tenant: true
        }
      });

      this.logger.log(`Found ${upcomingAppointments.length} appointments for tomorrow.`);

      for (const appointment of upcomingAppointments) {
        if (!appointment.patient.phone) {
          continue; // Skip if no phone number
        }

        const appointmentTime = appointment.appointmentDate.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: true });
        const message = `مرحباً ${appointment.patient.fullName}، نذكرك بموعدك القادم في ${appointment.tenant.name || 'العيادة'} غداً الساعة ${appointmentTime}. نرجو الحضور في الموعد المحدد. نتمنى لك دوام الصحة والعافية!`;

        // Direct database injection since Cron job has no TenantContext
        const log = await this.prisma.notificationLog.create({
          data: {
            tenantId: appointment.tenantId,
            patientId: appointment.patientId,
            type: NotificationType.WHATSAPP,
            message: message,
            status: NotificationStatus.PENDING,
          },
        });

        this.logger.log(`[MOCK WHATSAPP API] Sending WhatsApp to ${appointment.patient.phone}: ${message}`);
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        
        await this.prisma.notificationLog.update({
          where: { id: log.id },
          data: {
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error processing 24h reminders: ${error.message}`);
    }
  }
}
