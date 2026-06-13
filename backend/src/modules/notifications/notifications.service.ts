import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export class SendNotificationDto {
  patientId: string;
  type?: any;
  message: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendNotification(dto: SendNotificationDto) {
    this.logger.log(`Mock send notification to ${dto.patientId}: ${dto.message}`);
  }
}
