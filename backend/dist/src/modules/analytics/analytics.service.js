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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async getSummary(tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const totalPatients = await this.prisma.patient.count({
            where: { tenantId },
        });
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const appointmentsToday = await this.prisma.appointment.count({
            where: {
                tenantId,
                appointmentDate: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        const totalMedicalRecords = await this.prisma.medicalRecord.count({
            where: { tenantId },
        });
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const weeklyOverview = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const recentAppointments = await this.prisma.appointment.findMany({
            where: {
                tenantId,
                appointmentDate: {
                    gte: sevenDaysAgo,
                    lte: todayEnd,
                },
            },
            select: {
                appointmentDate: true,
            },
        });
        const appointmentsByDate = new Map();
        recentAppointments.forEach((app) => {
            const dateString = app.appointmentDate.toISOString().split('T')[0];
            appointmentsByDate.set(dateString, (appointmentsByDate.get(dateString) || 0) + 1);
        });
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            weeklyOverview.push({
                name: dayNames[d.getDay()],
                count: appointmentsByDate.get(dateString) || 0,
            });
        }
        return {
            totalPatients,
            appointmentsToday,
            totalMedicalRecords,
            weeklyOverview,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map