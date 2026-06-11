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
exports.StaffController = void 0;
const common_1 = require("@nestjs/common");
const staff_service_1 = require("./staff.service");
const staff_dto_1 = require("./dto/staff.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let StaffController = class StaffController {
    staffService;
    constructor(staffService) {
        this.staffService = staffService;
    }
    findAll(req) {
        return this.staffService.findAll(req.user.tenantId, req.user.isSuperAdmin ?? false);
    }
    create(dto, req) {
        return this.staffService.create(dto, req.user.tenantId, req.user.isSuperAdmin ?? false);
    }
    updateRole(id, dto, req) {
        return this.staffService.updateRole(id, dto, req.user.tenantId, req.user.isSuperAdmin ?? false);
    }
    toggleStatus(id, req) {
        return this.staffService.toggleStatus(id, req.user.tenantId, req.user.isSuperAdmin ?? false);
    }
};
exports.StaffController = StaffController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TENANT_ADMIN, client_1.UserRole.RECEPTIONIST),
    (0, swagger_1.ApiOperation)({ summary: 'List all staff for this clinic (or all clinics if SUPER_ADMIN)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new staff member (non-admins cannot assign SUPER_ADMIN role)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [staff_dto_1.CreateStaffDto, Object]),
    __metadata("design:returntype", void 0)
], StaffController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a staff member role (SUPER_ADMIN role is restricted to SUPER_ADMINs only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, staff_dto_1.UpdateStaffRoleDto, Object]),
    __metadata("design:returntype", void 0)
], StaffController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle staff account active/suspended status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StaffController.prototype, "toggleStatus", null);
exports.StaffController = StaffController = __decorate([
    (0, swagger_1.ApiTags)('Staff Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('staff'),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], StaffController);
//# sourceMappingURL=staff.controller.js.map