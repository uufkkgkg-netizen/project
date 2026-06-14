import { PrismaService } from '../../core/prisma/prisma.service';
export declare class SendNotificationDto {
    patientId: string;
    type?: any;
    message: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendNotification(dto: SendNotificationDto): Promise<void>;
}
