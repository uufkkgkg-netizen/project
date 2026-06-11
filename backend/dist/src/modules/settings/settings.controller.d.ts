import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(req: any): Promise<{
        id: string;
        subdomain: string | null;
        name: string;
        contactEmail: string | null;
        contactPhone: string | null;
        address: string | null;
        logoUrl: string | null;
        defaultCurrency: string;
    }>;
    updateSettings(dto: UpdateSettingsDto, req: any): Promise<{
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
