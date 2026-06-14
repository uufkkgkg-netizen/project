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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../core/prisma/prisma.service");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleCron() {
        this.logger.debug('Running WhatsApp Reminder Cron Job...');
        const now = new Date();
        const targetStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const targetEnd = new Date(targetStart.getTime() + 60 * 60 * 1000);
        const upcomingAppointments = await this.prisma.appointment.findMany({
            where: {
                appointmentDate: {
                    gte: targetStart,
                    lt: targetEnd,
                },
                status: 'PENDING',
            },
            include: {
                patient: true,
            },
        });
        this.logger.debug(`Found ${upcomingAppointments.length} appointments for reminder.`);
        for (const appt of upcomingAppointments) {
            if (!appt.patient.phone)
                continue;
            let status = 'PENDING';
            let errorMessage = null;
            try {
                const isSuccess = Math.random() > 0.1;
                if (isSuccess) {
                    status = 'SUCCESS';
                }
                else {
                    status = 'FAILED';
                    errorMessage = 'WhatsApp API Timeout';
                }
            }
            catch (err) {
                status = 'FAILED';
                errorMessage = err.message || 'Unknown error';
            }
            await this.prisma.whatsappLog.create({
                data: {
                    tenantId: appt.tenantId,
                    patientName: appt.patient.fullName,
                    patientPhone: appt.patient.phone,
                    appointmentDate: appt.appointmentDate,
                    status,
                    errorMessage,
                },
            });
        }
    }
    async getLogs(tenantId) {
        return this.prisma.whatsappLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
};
exports.WhatsappService = WhatsappService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappService.prototype, "handleCron", null);
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map