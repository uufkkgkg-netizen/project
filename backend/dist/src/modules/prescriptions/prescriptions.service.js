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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let PrescriptionsService = class PrescriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async create(createPrescriptionDto, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        return this.prisma.prescription.create({
            data: {
                tenantId,
                patientId: createPrescriptionDto.patientId,
                medicalRecordId: createPrescriptionDto.medicalRecordId,
                notes: createPrescriptionDto.notes,
                items: {
                    create: createPrescriptionDto.items.map((item) => ({
                        medicineName: item.medicineName,
                        dosage: item.dosage,
                        duration: item.duration,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
    }
    async findAll(tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        return this.prisma.prescription.findMany({
            where: {
                tenantId,
            },
            include: {
                items: true,
                patient: {
                    select: { fullName: true }
                },
                medicalRecord: {
                    select: { diagnosis: true }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findAllByPatient(patientId, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        return this.prisma.prescription.findMany({
            where: {
                tenantId,
                patientId,
            },
            include: {
                items: true,
                patient: true,
                medicalRecord: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const prescription = await this.prisma.prescription.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                items: true,
                patient: true,
            },
        });
        if (!prescription) {
            throw new common_1.NotFoundException(`Prescription with ID ${id} not found`);
        }
        return prescription;
    }
    async remove(id, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const existing = await this.prisma.prescription.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Prescription not found`);
        }
        return this.prisma.prescription.delete({
            where: { id },
        });
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map