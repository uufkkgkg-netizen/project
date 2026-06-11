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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    findAll(req, action, entity, tenantId, from, to, page = '1', limit = '50') {
        const isSuperAdmin = req.user?.isSuperAdmin ?? false;
        const effectiveTenantId = isSuperAdmin
            ? tenantId
            : req.user?.tenantId;
        return this.auditService.findAll({
            tenantId: effectiveTenantId,
            action,
            entity,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        });
    }
    async findOne(id, req) {
        const log = await this.auditService.findOne(id);
        if (!log)
            return null;
        const isSuperAdmin = req.user?.isSuperAdmin ?? false;
        if (!isSuperAdmin && log.tenantId !== req.user?.tenantId) {
            throw new common_1.ForbiddenException('لا يمكنك الاطلاع على سجلات خارج نطاق عيادتك');
        }
        return log;
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated audit logs — SUPER_ADMIN only' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'entity', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('from')),
    __param(5, (0, common_1.Query)('to')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single audit log with full JSON diff' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findOne", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Audit Logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map