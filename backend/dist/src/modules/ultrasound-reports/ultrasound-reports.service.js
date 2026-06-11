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
exports.UltrasoundReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let UltrasoundReportsService = class UltrasoundReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getStore() {
        const store = tenant_context_1.TenantContext.getStore();
        return {
            tenantId: store?.tenantId ?? null,
            userId: store?.userId ?? null,
        };
    }
    async generateReportFromTemplate(templateId, patientId) {
        const db = this.prisma.scoped;
        const [template, patient] = await Promise.all([
            db.medicalTemplate.findUnique({ where: { id: templateId } }),
            db.patient.findUnique({ where: { id: patientId } })
        ]);
        if (!template)
            throw new common_1.NotFoundException('القالب غير موجود');
        if (!patient)
            throw new common_1.NotFoundException('المريضة غير موجودة');
        let content = template.content;
        let age = 'غير مسجل';
        if (patient.dateOfBirth) {
            const diffMs = Date.now() - patient.dateOfBirth.getTime();
            const ageDt = new Date(diffMs);
            age = Math.abs(ageDt.getUTCFullYear() - 1970).toString();
        }
        const todayDate = new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' });
        const variables = {
            'patient_name': patient.fullName,
            'patient_phone': patient.phone || '—',
            'age': age,
            'file_number': patient.fileNumber.toString(),
            'blood_type': patient.bloodType || '—',
            'date': todayDate,
        };
        content = content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, p1) => {
            if (variables[p1]) {
                return variables[p1];
            }
            return '____';
        });
        return content;
    }
    async create(dto) {
        const { tenantId, userId } = this.getStore();
        const db = this.prisma;
        return db.ultrasoundReport.create({
            data: {
                tenantId: tenantId,
                doctorId: userId,
                patientId: dto.patientId,
                templateId: dto.templateId,
                date: new Date(),
                findings: dto.findings,
                measurements: dto.measurements || {},
                status: 'FINALIZED',
                imageUrls: dto.imageUrls || [],
            }
        });
    }
    async findAll() {
        const db = this.prisma.scoped;
        return db.ultrasoundReport.findMany({
            orderBy: { date: 'desc' },
            include: {
                patient: { select: { fullName: true, fileNumber: true } },
                doctor: { select: { firstName: true, lastName: true } },
            }
        });
    }
    async findByPatient(patientId) {
        const db = this.prisma.scoped;
        return db.ultrasoundReport.findMany({
            where: { patientId },
            orderBy: { date: 'desc' },
            include: {
                doctor: { select: { firstName: true, lastName: true } },
                template: { select: { title: true } }
            }
        });
    }
};
exports.UltrasoundReportsService = UltrasoundReportsService;
exports.UltrasoundReportsService = UltrasoundReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UltrasoundReportsService);
//# sourceMappingURL=ultrasound-reports.service.js.map