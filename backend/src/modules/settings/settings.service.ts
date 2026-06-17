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

    const tenant = await this.prisma.tenant.findUnique({
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
        primaryColor: true,
        accentColor: true,
        enabledModules: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        settings: true, // TenantSettings (one-to-one)
      },
    });

    if (!tenant) throw new NotFoundException('العيادة غير موجودة');

    // Auto-create TenantSettings if not exists
    if (!tenant.settings) {
      const newSettings = await this.prisma.tenantSettings.create({
        data: { tenantId },
      });
      return { ...tenant, settings: newSettings };
    }

    return tenant;
  }

  async updateSettings(dto: UpdateSettingsDto, tenantIdParam?: string) {
    const tenantId = tenantIdParam || this.tenantId;

    // ── Update Tenant basic info ──────────────────────────────────────────
    const tenantUpdate: any = {};
    if (dto.name !== undefined)            tenantUpdate.name            = dto.name;
    if (dto.contactEmail !== undefined)    tenantUpdate.contactEmail    = dto.contactEmail;
    if (dto.contactPhone !== undefined)    tenantUpdate.contactPhone    = dto.contactPhone;
    if (dto.address !== undefined)         tenantUpdate.address         = dto.address;
    if (dto.logoUrl !== undefined)         tenantUpdate.logoUrl         = dto.logoUrl;
    if (dto.defaultCurrency !== undefined) tenantUpdate.defaultCurrency = dto.defaultCurrency;
    if (dto.primaryColor !== undefined)    tenantUpdate.primaryColor    = dto.primaryColor;
    if (dto.accentColor !== undefined)     tenantUpdate.accentColor     = dto.accentColor;

    if (Object.keys(tenantUpdate).length > 0) {
      await this.prisma.tenant.update({ where: { id: tenantId }, data: tenantUpdate });
    }

    // ── Upsert TenantSettings ─────────────────────────────────────────────
    const settingsUpdate: any = {};
    if (dto.timezone !== undefined)              settingsUpdate.timezone              = dto.timezone;
    if (dto.language !== undefined)              settingsUpdate.language              = dto.language;
    if (dto.taxRate !== undefined)               settingsUpdate.taxRate               = dto.taxRate;
    if (dto.invoicePrefix !== undefined)         settingsUpdate.invoicePrefix         = dto.invoicePrefix;
    if (dto.invoiceStartNumber !== undefined)    settingsUpdate.invoiceStartNumber    = dto.invoiceStartNumber;
    if (dto.workingDays !== undefined)           settingsUpdate.workingDays           = dto.workingDays;
    if (dto.workStartTime !== undefined)         settingsUpdate.workStartTime         = dto.workStartTime;
    if (dto.workEndTime !== undefined)           settingsUpdate.workEndTime           = dto.workEndTime;
    if (dto.appointmentDuration !== undefined)   settingsUpdate.appointmentDuration   = dto.appointmentDuration;
    if (dto.appointmentBuffer !== undefined)     settingsUpdate.appointmentBuffer     = dto.appointmentBuffer;
    if (dto.maxDailyAppointments !== undefined)  settingsUpdate.maxDailyAppointments  = dto.maxDailyAppointments;
    if (dto.noShowPolicy !== undefined)          settingsUpdate.noShowPolicy          = dto.noShowPolicy;
    if (dto.doctorName !== undefined)            settingsUpdate.doctorName            = dto.doctorName;
    if (dto.doctorSpecialty !== undefined)       settingsUpdate.doctorSpecialty       = dto.doctorSpecialty;
    if (dto.licenseNumber !== undefined)         settingsUpdate.licenseNumber         = dto.licenseNumber;
    if (dto.printHeader !== undefined)           settingsUpdate.printHeader           = dto.printHeader;
    if (dto.printFooter !== undefined)           settingsUpdate.printFooter           = dto.printFooter;
    if (dto.stampImageUrl !== undefined)         settingsUpdate.stampImageUrl         = dto.stampImageUrl;
    if (dto.signatureImageUrl !== undefined)     settingsUpdate.signatureImageUrl     = dto.signatureImageUrl;
    if (dto.whatsappEnabled !== undefined)       settingsUpdate.whatsappEnabled       = dto.whatsappEnabled;
    if (dto.reminderHoursBefore !== undefined)   settingsUpdate.reminderHoursBefore   = dto.reminderHoursBefore;
    if (dto.quietHoursStart !== undefined)       settingsUpdate.quietHoursStart       = dto.quietHoursStart;
    if (dto.quietHoursEnd !== undefined)         settingsUpdate.quietHoursEnd         = dto.quietHoursEnd;
    if (dto.sendConfirmation !== undefined)      settingsUpdate.sendConfirmation      = dto.sendConfirmation;
    if (dto.sendReminder !== undefined)          settingsUpdate.sendReminder          = dto.sendReminder;
    if (dto.sendAfterVisit !== undefined)        settingsUpdate.sendAfterVisit        = dto.sendAfterVisit;
    if (dto.sessionDurationMins !== undefined)   settingsUpdate.sessionDurationMins   = dto.sessionDurationMins;
    if (dto.require2FA !== undefined)            settingsUpdate.require2FA            = dto.require2FA;
    if (dto.passwordMinLength !== undefined)     settingsUpdate.passwordMinLength     = dto.passwordMinLength;

    if (Object.keys(settingsUpdate).length > 0) {
      await this.prisma.tenantSettings.upsert({
        where: { tenantId },
        create: { tenantId, ...settingsUpdate },
        update: settingsUpdate,
      });
    }

    return this.getSettings(tenantId);
  }
}
