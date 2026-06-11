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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getAllClinics() {
        return this.adminService.getAllClinics();
    }
    updateSubscription(tenantId, dto, req) {
        const adminEmail = req.user?.email ?? 'system';
        return this.adminService.updateSubscription(tenantId, dto, adminEmail);
    }
    getSubscriptionHistory(tenantId) {
        return this.adminService.getSubscriptionHistory(tenantId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('clinics'),
    (0, swagger_1.ApiOperation)({ summary: '[Super Admin] List all registered clinics with subscription info' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllClinics", null);
__decorate([
    (0, common_1.Patch)('clinics/:tenantId/subscription'),
    (0, swagger_1.ApiOperation)({ summary: '[Super Admin] Update a clinic subscription status and plan' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_dto_1.UpdateSubscriptionDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Get)('clinics/:tenantId/subscription/history'),
    (0, swagger_1.ApiOperation)({ summary: '[Super Admin] Get subscription change audit log for a clinic' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubscriptionHistory", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map