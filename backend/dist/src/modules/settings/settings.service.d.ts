import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get tenantId();
    getSettings(tenantIdParam?: string): Promise<{
        id: string;
        subdomain: string | null;
        name: string;
        contactEmail: string | null;
        contactPhone: string | null;
        address: string | null;
        logoUrl: string | null;
        defaultCurrency: string;
    }>;
    updateSettings(dto: UpdateSettingsDto, tenantIdParam?: string): Promise<{
        id: string;
        subdomain: string | null;
        name: string;
        contactEmail: string | null;
        contactPhone: string | null;
        address: string | null;
        logoUrl: string | null;
        defaultCurrency: string;
    }>;
}
