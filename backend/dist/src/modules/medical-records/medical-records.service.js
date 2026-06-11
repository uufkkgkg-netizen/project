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
exports.MedicalRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let MedicalRecordsService = class MedicalRecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async create(createDto, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const patient = await this.prisma.patient.findFirst({
            where: { id: createDto.patientId, tenantId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.prisma.$transaction(async (tx) => {
            const record = await tx.medicalRecord.create({
                data: {
                    tenantId,
                    patientId: createDto.patientId,
                    appointmentId: createDto.appointmentId,
                    chiefComplaint: createDto.chiefComplaint,
                    diagnosis: createDto.diagnosis,
                    vitals: createDto.vitals ? createDto.vitals : undefined,
                    notes: createDto.notes,
                },
            });
            if (createDto.prescriptionItems && createDto.prescriptionItems.length > 0) {
                await tx.prescription.create({
                    data: {
                        tenantId,
                        patientId: createDto.patientId,
                        medicalRecordId: record.id,
                        notes: createDto.prescriptionNotes,
                        items: {
                            create: createDto.prescriptionItems.map(item => ({
                                medicineName: item.medicineName,
                                dosage: item.dosage,
                                duration: item.duration,
                            })),
                        },
                    },
                });
            }
            return tx.medicalRecord.findFirst({
                where: { id: record.id, tenantId },
                include: {
                    prescription: {
                        include: { items: true },
                    },
                    patient: true,
                },
            });
        });
    }
    async findAllByPatient(patientId) {
        return this.prisma.medicalRecord.findMany({
            where: { patientId, tenantId: this.tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                prescription: {
                    include: {
                        items: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const record = await this.prisma.medicalRecord.findFirst({
            where: { id, tenantId: this.tenantId },
            include: {
                prescription: {
                    include: { items: true },
                },
                patient: true,
            },
        });
        if (!record)
            throw new common_1.NotFoundException('Medical Record not found');
        return record;
    }
};
exports.MedicalRecordsService = MedicalRecordsService;
exports.MedicalRecordsService = MedicalRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicalRecordsService);
//# sourceMappingURL=medical-records.service.js.map