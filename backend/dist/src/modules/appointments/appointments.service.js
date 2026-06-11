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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let AppointmentsService = class AppointmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async create(createAppointmentDto, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        await this.validateDoctorExists(createAppointmentDto.doctorId, tenantId);
        await this.validateNoOverlap(createAppointmentDto.doctorId, new Date(createAppointmentDto.appointmentDate), createAppointmentDto.durationMinutes || 30, null, tenantId);
        return this.prisma.appointment.create({
            data: {
                ...createAppointmentDto,
                appointmentDate: new Date(createAppointmentDto.appointmentDate),
                durationMinutes: createAppointmentDto.durationMinutes || 30,
                tenantId,
            },
        });
    }
    async findAll(userRole, userId) {
        const whereClause = { tenantId: this.tenantId };
        if (userRole === 'DOCTOR') {
            whereClause.doctorId = userId;
        }
        return this.prisma.appointment.findMany({
            where: whereClause,
            orderBy: [{ appointmentDate: 'asc' }],
            include: {
                patient: {
                    select: { id: true, fullName: true, fileNumber: true, phone: true }
                },
                doctor: {
                    select: { id: true, firstName: true, lastName: true }
                }
            },
        });
    }
    async findOne(id, userRole, userId) {
        const appointment = await this.prisma.appointment.findFirst({
            where: { id, tenantId: this.tenantId },
            include: {
                patient: { select: { id: true, fullName: true, fileNumber: true, phone: true } },
                doctor: { select: { id: true, firstName: true, lastName: true } }
            },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own appointments');
        }
        return appointment;
    }
    async update(id, updateAppointmentDto, userRole, userId) {
        const appointment = await this.findOne(id, userRole, userId);
        if (updateAppointmentDto.appointmentDate || updateAppointmentDto.durationMinutes) {
            const newDate = updateAppointmentDto.appointmentDate ? new Date(updateAppointmentDto.appointmentDate) : appointment.appointmentDate;
            const newDuration = updateAppointmentDto.durationMinutes || appointment.durationMinutes;
            const doctorId = updateAppointmentDto.doctorId || appointment.doctorId;
            if (updateAppointmentDto.doctorId) {
                await this.validateDoctorExists(updateAppointmentDto.doctorId, this.tenantId);
            }
            await this.validateNoOverlap(doctorId, newDate, newDuration, id, this.tenantId);
        }
        if (userRole === 'DOCTOR' && updateAppointmentDto.status) {
            if (!['IN_PROGRESS', 'COMPLETED'].includes(updateAppointmentDto.status)) {
                throw new common_1.ForbiddenException('Doctors can only mark appointments as IN_PROGRESS or COMPLETED');
            }
        }
        const dataToUpdate = { ...updateAppointmentDto };
        if (updateAppointmentDto.appointmentDate) {
            dataToUpdate.appointmentDate = new Date(updateAppointmentDto.appointmentDate);
        }
        return this.prisma.appointment.update({
            where: { id },
            data: dataToUpdate,
        });
    }
    async remove(id, userRole, userId) {
        await this.findOne(id, userRole, userId);
        return this.prisma.appointment.delete({
            where: { id },
        });
    }
    async validateDoctorExists(doctorId, tenantId) {
        const doctor = await this.prisma.user.findFirst({
            where: { id: doctorId, tenantId, role: 'DOCTOR' }
        });
        if (!doctor) {
            throw new common_1.BadRequestException('Invalid doctor ID or the user is not a doctor');
        }
    }
    async validateNoOverlap(doctorId, newStart, durationMinutes, excludeAppointmentId, tenantId) {
        const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);
        const startOfDay = new Date(newStart);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(newStart);
        endOfDay.setHours(23, 59, 59, 999);
        const existingAppointments = await this.prisma.appointment.findMany({
            where: {
                tenantId,
                doctorId,
                appointmentDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
                status: { notIn: ['CANCELLED'] }
            }
        });
        for (const app of existingAppointments) {
            const appStart = new Date(app.appointmentDate);
            const appEnd = new Date(appStart.getTime() + app.durationMinutes * 60000);
            if (newStart < appEnd && newEnd > appStart) {
                throw new common_1.BadRequestException('هذا الموعد يتعارض مع موعد آخر محجوز لنفس الطبيب.');
            }
        }
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map