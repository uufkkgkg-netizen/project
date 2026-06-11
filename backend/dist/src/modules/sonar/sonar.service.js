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
exports.SonarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let SonarService = class SonarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get tenantId() {
        const store = tenant_context_1.TenantContext.getStore();
        return store?.tenantId || '';
    }
    async create(createSonarDto, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        return this.prisma.ultrasoundReport.create({
            data: {
                tenantId,
                patientId: createSonarDto.patientId,
                date: new Date(createSonarDto.date),
                findings: createSonarDto.findings,
                imageUrls: createSonarDto.imageUrls || [],
            },
            include: {
                patient: true,
            },
        });
    }
    async findAll(tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        return this.prisma.ultrasoundReport.findMany({
            where: {
                tenantId,
            },
            include: {
                patient: {
                    select: { fullName: true }
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }
    async findOne(id, tenantIdParam) {
        const tenantId = tenantIdParam || this.tenantId;
        const report = await this.prisma.ultrasoundReport.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                patient: true,
            },
        });
        if (!report) {
            throw new common_1.NotFoundException(`Ultrasound report with ID ${id} not found`);
        }
        return report;
    }
};
exports.SonarService = SonarService;
exports.SonarService = SonarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SonarService);
//# sourceMappingURL=sonar.service.js.map