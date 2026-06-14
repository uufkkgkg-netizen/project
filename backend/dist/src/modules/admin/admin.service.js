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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllClinics() {
        return this.prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
                subdomain: true,
                contactEmail: true,
                isActive: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                trialEndsAt: true,
                subscriptionEndsAt: true,
                createdAt: true,
                _count: {
                    select: {
                        patients: true,
                        appointments: true,
                        users: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateSubscription(tenantId, dto, adminEmail) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException(`Clinic with ID ${tenantId} not found`);
        const [updated] = await this.prisma.$transaction([
            this.prisma.tenant.update({
                where: { id: tenantId },
                data: {
                    subscriptionStatus: dto.status,
                    subscriptionPlan: dto.plan,
                    isActive: dto.status !== 'suspended' && dto.status !== 'canceled',
                },
                select: {
                    id: true, name: true,
                    subscriptionStatus: true,
                    subscriptionPlan: true,
                    isActive: true,
                },
            }),
            this.prisma.clinicSubscription.create({
                data: {
                    tenantId,
                    previousStatus: tenant.subscriptionStatus,
                    newStatus: dto.status,
                    previousPlan: tenant.subscriptionPlan,
                    newPlan: dto.plan,
                    changedBy: adminEmail,
                    reason: dto.reason,
                },
            }),
        ]);
        return updated;
    }
    async getSubscriptionHistory(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException(`Clinic not found`);
        return this.prisma.clinicSubscription.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map