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
exports.PatientPortalController = void 0;
const common_1 = require("@nestjs/common");
const patient_portal_service_1 = require("./patient-portal.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
let PatientPortalController = class PatientPortalController {
    portalService;
    constructor(portalService) {
        this.portalService = portalService;
    }
    async login(dto, res) {
        const result = await this.portalService.login(dto);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('portal_access_token', result.access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });
        return { patient: result.patient };
    }
    async logout(res) {
        res.clearCookie('portal_access_token', { path: '/' });
        return { message: 'Logged out successfully' };
    }
    async getMe(req) {
        if (req.user.role !== 'PATIENT') {
            throw new Error('Unauthorized');
        }
        return {
            patient: {
                id: req.user.patientId,
                fullName: req.user.fullName,
                tenantName: req.user.tenantName,
            }
        };
    }
    getDashboard(req) {
        if (req.user.role !== 'PATIENT') {
            throw new Error('Unauthorized');
        }
        return this.portalService.getDashboardData(req.user.patientId);
    }
};
exports.PatientPortalController = PatientPortalController;
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login for patients using phone and file number' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [patient_portal_service_1.PatientLoginDto, Object]),
    __metadata("design:returntype", Promise)
], PatientPortalController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout for patients' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientPortalController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('auth/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current patient session' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientPortalController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient dashboard data' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PatientPortalController.prototype, "getDashboard", null);
exports.PatientPortalController = PatientPortalController = __decorate([
    (0, swagger_1.ApiTags)('Patient Portal'),
    (0, common_1.Controller)('patient-portal'),
    __metadata("design:paramtypes", [patient_portal_service_1.PatientPortalService])
], PatientPortalController);
//# sourceMappingURL=patient-portal.controller.js.map