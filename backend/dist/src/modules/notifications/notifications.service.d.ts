import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class SendNotificationDto {
    patientId: string;
    type?: NotificationType;
    message: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private get tenantId();
    sendNotification(dto: SendNotificationDto): Promise<void>;
    handleUpcomingAppointmentsReminders(): Promise<void>;
}
