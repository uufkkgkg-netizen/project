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
            throw new common_1.NotFoundException('العيادة غير موجودة');
        }
        return settings;
    }
    async updateSettings(dto, tenantIdParam) {
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map