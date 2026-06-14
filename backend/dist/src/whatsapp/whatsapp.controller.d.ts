import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    getLogs(req: any): Promise<{
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
