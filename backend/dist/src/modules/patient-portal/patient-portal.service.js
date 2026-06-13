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
exports.PatientPortalService = exports.PatientLoginDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
class PatientLoginDto {
    phone;
    fileNumber;
}
exports.PatientLoginDto = PatientLoginDto;
let PatientPortalService = class PatientPortalService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const phoneStr = dto.phone.trim();
        const fileNum = Number(dto.fileNumber);
        const patient = await this.prisma.patient.findFirst({
            where: {
                phone: {
                    contains: phoneStr,
                },
                fileNumber: fileNum,
            },
            include: {
                tenant: true
            }
        });
        if (!patient) {
            throw new common_1.UnauthorizedException('بيانات الدخول غير صحيحة، يرجى التأكد من رقم الهاتف ورقم الملف');
        }
        if (!patient.isActive) {
            throw new common_1.UnauthorizedException('عذراً، هذا الملف غير نشط، راجع إدارة العيادة');
        }
        const payload = {
            sub: patient.id,
            patientId: patient.id,
            tenantId: patient.tenantId,
            role: 'PATIENT',
            fullName: patient.fullName,
            tenantName: patient.tenant.name
        };
        return {
            access_token: this.jwtService.sign(payload),
            patient: {
                id: patient.id,
                fullName: patient.fullName,
                phone: patient.phone,
                tenantName: patient.tenant.name
            }
        };
    }
    async getDashboardData(patientId) {
        const now = new Date();
        const upcomingAppointments = await this.prisma.appointment.findMany({
            where: {
                patientId,
                appointmentDate: { gte: now },
            },
            orderBy: { appointmentDate: 'asc' },
            take: 3,
            include: { doctor: { select: { firstName: true, lastName: true } } }
        });
        const pastAppointments = await this.prisma.appointment.findMany({
            where: {
                patientId,
                appointmentDate: { lt: now },
            },
            orderBy: { appointmentDate: 'desc' },
            take: 5,
            include: { doctor: { select: { firstName: true, lastName: true } } }
        });
        const ultrasounds = await this.prisma.ultrasoundReport.findMany({
            where: { patientId },
            orderBy: { date: 'desc' },
            take: 5,
            include: { doctor: { select: { firstName: true, lastName: true } } }
        });
        const prescriptions = await this.prisma.prescription.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        return {
            upcomingAppointments,
            pastAppointments,
            ultrasounds,
            prescriptions
        };
    }
};
exports.PatientPortalService = PatientPortalService;
exports.PatientPortalService = PatientPortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], PatientPortalService);
//# sourceMappingURL=patient-portal.service.js.map