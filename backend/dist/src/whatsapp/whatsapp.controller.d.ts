import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    getLogs(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        appointmentDate: Date;
        status: import(".prisma/client").$Enums.WhatsappStatus;
        patientName: string;
        patientPhone: string;
        errorMessage: string | null;
    }[]>;
}
