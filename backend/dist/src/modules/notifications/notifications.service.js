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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = exports.SendNotificationDto = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
const client_1 = require("@prisma/client");
class SendNotificationDto {
    patientId;
    type;
    message;
}
exports.SendNotificationDto = SendNotificationDto;
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async sendNotification(dto) {
        const tenantId = this.tenantId;
        if (!tenantId) {
            this.logger.warn('No tenantId found in context. Skipping notification.');
            return;
        }
        try {
            const log = await this.prisma.notificationLog.create({
                data: {
                    tenantId,
                    patientId: dto.patientId,
                    type: dto.type || client_1.NotificationType.SMS,
                    message: dto.message,
                    status: client_1.NotificationStatus.PENDING,
                },
            });
            this.logger.log(`[MOCK] Sending ${log.type} to patient ${dto.patientId}: ${dto.message}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.prisma.notificationLog.update({
                where: { id: log.id },
                data: {
                    status: client_1.NotificationStatus.SENT,
                    sentAt: new Date(),
                },
            });
            this.logger.log(`Successfully sent ${dto.type} notification to ${dto.patientId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification: ${error.message}`);
        }
    }
    async handleUpcomingAppointmentsReminders() {
        this.logger.log('Running 24h appointment reminder cron job...');
        const now = new Date();
        const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
        try {
            const upcomingAppointments = await this.prisma.appointment.findMany({
                where: {
                    appointmentDate: {
                        gte: tomorrowStart,
                        lt: tomorrowEnd,
                    },
                    status: { in: [client_1.AppointmentStatus.PENDING, client_1.AppointmentStatus.CONFIRMED] }
                },
                include: {
                    patient: true,
                    tenant: true
                }
            });
            this.logger.log(`Found ${upcomingAppointments.length} appointments for tomorrow.`);
            for (const appointment of upcomingAppointments) {
                if (!appointment.patient.phone) {
                    continue;
                }
                const appointmentTime = appointment.appointmentDate.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: true });
                const message = `مرحباً ${appointment.patient.fullName}، نذكرك بموعدك القادم في ${appointment.tenant.name || 'العيادة'} غداً الساعة ${appointmentTime}. نرجو الحضور في الموعد المحدد. نتمنى لك دوام الصحة والعافية!`;
                const log = await this.prisma.notificationLog.create({
                    data: {
                        tenantId: appointment.tenantId,
                        patientId: appointment.patientId,
                        type: client_1.NotificationType.WHATSAPP,
                        message: message,
                        status: client_1.NotificationStatus.PENDING,
                    },
                });
                this.logger.log(`[MOCK WHATSAPP API] Sending WhatsApp to ${appointment.patient.phone}: ${message}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                await this.prisma.notificationLog.update({
                    where: { id: log.id },
                    data: {
                        status: client_1.NotificationStatus.SENT,
                        sentAt: new Date(),
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Error processing 24h reminders: ${error.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handleUpcomingAppointmentsReminders", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map