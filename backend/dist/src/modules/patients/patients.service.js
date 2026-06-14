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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let PatientsService = class PatientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getStore() {
        const store = tenant_context_1.TenantContext.getStore();
        return {
            tenantId: store?.tenantId ?? null,
            userId: store?.userId ?? null,
            isSuperAdmin: store?.isSuperAdmin ?? false,
        };
    }
    async create(createPatientDto) {
        const { tenantId, isSuperAdmin } = this.getStore();
        if (!tenantId && !isSuperAdmin) {
            throw new common_1.ForbiddenException('لا يمكن إنشاء مريض بدون عيادة محددة');
        }
        const db = this.prisma;
        return db.patient.create({
            data: {
                ...createPatientDto,
                dateOfBirth: createPatientDto.dateOfBirth
                    ? new Date(createPatientDto.dateOfBirth)
                    : null,
                tenantId: tenantId,
            },
        });
    }
    async findAll() {
        const db = this.prisma.scoped;
        return db.patient.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fileNumber: true,
                fullName: true,
                phone: true,
                bloodType: true,
                createdAt: true,
            }
        });
    }
    async findOne(id) {
        const db = this.prisma.scoped;
        const patient = await db.patient.findFirst({
            where: { id },
            include: {
                visits: {
                    orderBy: { visitDate: 'desc' },
                    include: {
                        doctor: { select: { firstName: true, lastName: true } }
                    }
                }
            }
        });
        if (!patient)
            throw new common_1.NotFoundException('المريض غير موجود');
        return patient;
    }
    async update(id, updatePatientDto) {
        await this.findOne(id);
        const db = this.prisma.scoped;
        const data = { ...updatePatientDto };
        if (updatePatientDto.dateOfBirth) {
            data.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
        }
        return db.patient.update({
            where: { id },
            data,
        });
    }
    async createVisit(patientId, createVisitDto) {
        await this.findOne(patientId);
        const { tenantId, userId } = this.getStore();
        const db = this.prisma;
        return db.visit.create({
            data: {
                ...createVisitDto,
                patientId,
                tenantId: tenantId,
                doctorId: userId,
            }
        });
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map