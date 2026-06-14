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
exports.MedicalTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const tenant_context_1 = require("../../core/prisma/tenant.context");
let MedicalTemplatesService = class MedicalTemplatesService {
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
    async findAll(category) {
        const db = this.prisma.scoped;
        return db.medicalTemplate.findMany({
            where: category ? { category, isActive: true } : { isActive: true },
            orderBy: [{ category: 'asc' }, { title: 'asc' }],
            select: {
                id: true, title: true, category: true,
                content: true, isActive: true,
                createdAt: true, updatedAt: true,
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });
    }
    async findOne(id) {
        const db = this.prisma.scoped;
        const template = await db.medicalTemplate.findFirst({
            where: { id },
            include: { creator: { select: { id: true, firstName: true, lastName: true } } }
        });
        if (!template)
            throw new common_1.NotFoundException('القالب غير موجود');
        return template;
    }
    async create(dto) {
        const { tenantId, userId, isSuperAdmin } = this.getStore();
        if (!tenantId && !isSuperAdmin) {
            throw new common_1.ForbiddenException('لا يمكن إنشاء قالب بدون عيادة محددة');
        }
        const db = this.prisma;
        return db.medicalTemplate.create({
            data: {
                tenantId: tenantId,
                title: dto.title,
                category: dto.category,
                content: dto.content,
                createdBy: userId ?? undefined,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const db = this.prisma.scoped;
        return db.medicalTemplate.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const db = this.prisma.scoped;
        return db.medicalTemplate.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.MedicalTemplatesService = MedicalTemplatesService;
exports.MedicalTemplatesService = MedicalTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicalTemplatesService);
//# sourceMappingURL=medical-templates.service.js.map