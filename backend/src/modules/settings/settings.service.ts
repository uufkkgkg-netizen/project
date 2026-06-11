import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async getSettings(tenantIdParam?: string) {
    const tenantId = tenantIdParam || this.tenantId;
    const settings = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        logoUrl: true,
        defaultCurrency: true,
      },
    });

    if (!settings) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto, tenantIdParam?: string) {
    const tenantId = tenantIdParam || this.tenantId;
    
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        address: dto.address,
        logoUrl: dto.logoUrl,
        defaultCurrency: dto.defaultCurrency,
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        logoUrl: true,
        defaultCurrency: true,
      },
    });
  }
}
