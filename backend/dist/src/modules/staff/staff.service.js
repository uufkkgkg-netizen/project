"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const staff_dto_1 = require("./dto/staff.dto");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
let StaffService = class StaffService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    assertSameTenant(actorTenantId, targetTenantId, isSuperAdmin) {
        if (isSuperAdmin)
            return;
        if (!actorTenantId || actorTenantId !== targetTenantId) {
            throw new common_1.ForbiddenException('لا يمكنك إدارة موظفين خارج نطاق عيادتك');
        }
    }
    async findAll(tenantId, isSuperAdmin) {
        const where = isSuperAdmin ? {} : { tenantId };
        return this.prisma.user.findMany({
            where,
            select: {
                id: true, firstName: true, lastName: true,
                email: true, phone: true, isActive: true,
                createdAt: true, lastLogin: true,
                tenant: { select: { id: true, name: true } },
                role: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(dto, actorTenantId, actorIsSuperAdmin) {
        if (!actorIsSuperAdmin && !staff_dto_1.ASSIGNABLE_ROLES.includes(dto.role)) {
            throw new common_1.ForbiddenException('لا يمكنك تعيين هذا الدور');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser)
            throw new common_1.BadRequestException('البريد الإلكتروني مستخدم مسبقاً');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        return this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                passwordHash,
                tenantId: actorIsSuperAdmin ? null : actorTenantId,
                role: dto.role,
            },
            select: {
                id: true, firstName: true, lastName: true,
                email: true, isActive: true,
                role: true,
            },
        });
    }
    async updateRole(staffId, dto, actorTenantId, actorIsSuperAdmin) {
        const staff = await this.prisma.user.findUnique({
            where: { id: staffId },
            select: { id: true, tenantId: true, role: true },
        });
        if (!staff)
            throw new common_1.NotFoundException('الموظف غير موجود');
        this.assertSameTenant(actorTenantId, staff.tenantId, actorIsSuperAdmin);
        if (!actorIsSuperAdmin && !staff_dto_1.ASSIGNABLE_ROLES.includes(dto.role)) {
            throw new common_1.ForbiddenException('لا يمكنك تعيين هذا الدور');
        }
        return this.prisma.user.update({
            where: { id: staffId },
            data: { role: dto.role },
            select: { id: true, firstName: true, lastName: true, role: true },
        });
    }
    async toggleStatus(staffId, actorTenantId, actorIsSuperAdmin) {
        const staff = await this.prisma.user.findUnique({
            where: { id: staffId },
            select: { id: true, tenantId: true, isActive: true, role: true },
        });
        if (!staff)
            throw new common_1.NotFoundException('الموظف غير موجود');
        this.assertSameTenant(actorTenantId, staff.tenantId, actorIsSuperAdmin);
        if (!actorIsSuperAdmin && staff.role === client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('لا يمكنك تعليق حساب مدير عام');
        }
        return this.prisma.user.update({
            where: { id: staffId },
            data: { isActive: !staff.isActive },
            select: { id: true, firstName: true, lastName: true, isActive: true },
        });
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map