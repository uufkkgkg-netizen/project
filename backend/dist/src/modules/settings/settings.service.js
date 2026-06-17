"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async getSettings(tenantIdParam) {
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
                settings: true,
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('العيادة غير موجودة');
        if (!tenant.settings) {
            const newSettings = await this.prisma.tenantSettings.create({
                data: { tenantId },
            });
            return { ...tenant, settings: newSettings };
        }
        return tenant;
    }
    async updateSettings(dto, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const tenantUpdate = {};
        if (dto.name !== undefined)
            tenantUpdate.name = dto.name;
        if (dto.contactEmail !== undefined)
            tenantUpdate.contactEmail = dto.contactEmail;
        if (dto.contactPhone !== undefined)
            tenantUpdate.contactPhone = dto.contactPhone;
        if (dto.address !== undefined)
            tenantUpdate.address = dto.address;
        if (dto.logoUrl !== undefined)
            tenantUpdate.logoUrl = dto.logoUrl;
        if (dto.defaultCurrency !== undefined)
            tenantUpdate.defaultCurrency = dto.defaultCurrency;
        if (dto.primaryColor !== undefined)
            tenantUpdate.primaryColor = dto.primaryColor;
        if (dto.accentColor !== undefined)
            tenantUpdate.accentColor = dto.accentColor;
        if (Object.keys(tenantUpdate).length > 0) {
            await this.prisma.tenant.update({ where: { id: tenantId }, data: tenantUpdate });
        }
        const settingsUpdate = {};
        if (dto.timezone !== undefined)
            settingsUpdate.timezone = dto.timezone;
        if (dto.language !== undefined)
            settingsUpdate.language = dto.language;
        if (dto.taxRate !== undefined)
            settingsUpdate.taxRate = dto.taxRate;
        if (dto.invoicePrefix !== undefined)
            settingsUpdate.invoicePrefix = dto.invoicePrefix;
        if (dto.invoiceStartNumber !== undefined)
            settingsUpdate.invoiceStartNumber = dto.invoiceStartNumber;
        if (dto.workingDays !== undefined)
            settingsUpdate.workingDays = dto.workingDays;
        if (dto.workStartTime !== undefined)
            settingsUpdate.workStartTime = dto.workStartTime;
        if (dto.workEndTime !== undefined)
            settingsUpdate.workEndTime = dto.workEndTime;
        if (dto.appointmentDuration !== undefined)
            settingsUpdate.appointmentDuration = dto.appointmentDuration;
        if (dto.appointmentBuffer !== undefined)
            settingsUpdate.appointmentBuffer = dto.appointmentBuffer;
        if (dto.maxDailyAppointments !== undefined)
            settingsUpdate.maxDailyAppointments = dto.maxDailyAppointments;
        if (dto.noShowPolicy !== undefined)
            settingsUpdate.noShowPolicy = dto.noShowPolicy;
        if (dto.doctorName !== undefined)
            settingsUpdate.doctorName = dto.doctorName;
        if (dto.doctorSpecialty !== undefined)
            settingsUpdate.doctorSpecialty = dto.doctorSpecialty;
        if (dto.licenseNumber !== undefined)
            settingsUpdate.licenseNumber = dto.licenseNumber;
        if (dto.printHeader !== undefined)
            settingsUpdate.printHeader = dto.printHeader;
        if (dto.printFooter !== undefined)
            settingsUpdate.printFooter = dto.printFooter;
        if (dto.stampImageUrl !== undefined)
            settingsUpdate.stampImageUrl = dto.stampImageUrl;
        if (dto.signatureImageUrl !== undefined)
            settingsUpdate.signatureImageUrl = dto.signatureImageUrl;
        if (dto.whatsappEnabled !== undefined)
            settingsUpdate.whatsappEnabled = dto.whatsappEnabled;
        if (dto.reminderHoursBefore !== undefined)
            settingsUpdate.reminderHoursBefore = dto.reminderHoursBefore;
        if (dto.quietHoursStart !== undefined)
            settingsUpdate.quietHoursStart = dto.quietHoursStart;
        if (dto.quietHoursEnd !== undefined)
            settingsUpdate.quietHoursEnd = dto.quietHoursEnd;
        if (dto.sendConfirmation !== undefined)
            settingsUpdate.sendConfirmation = dto.sendConfirmation;
        if (dto.sendReminder !== undefined)
            settingsUpdate.sendReminder = dto.sendReminder;
        if (dto.sendAfterVisit !== undefined)
            settingsUpdate.sendAfterVisit = dto.sendAfterVisit;
        if (dto.sessionDurationMins !== undefined)
            settingsUpdate.sessionDurationMins = dto.sessionDurationMins;
        if (dto.require2FA !== undefined)
            settingsUpdate.require2FA = dto.require2FA;
        if (dto.passwordMinLength !== undefined)
            settingsUpdate.passwordMinLength = dto.passwordMinLength;
        if (Object.keys(settingsUpdate).length > 0) {
            await this.prisma.tenantSettings.upsert({
                where: { tenantId },
                create: { tenantId, ...settingsUpdate },
                update: settingsUpdate,
            });
        }
        return this.getSettings(tenantId);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map