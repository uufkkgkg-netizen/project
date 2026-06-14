import { PrismaService } from '../core/prisma/prisma.service';
export declare class WhatsappService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCron(): Promise<void>;
    getLogs(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.WhatsappStatus;
        appointmentDate: Date;
        patientName: string;
        patientPhone: string;
        errorMessage: string | null;
    }[]>;
}
