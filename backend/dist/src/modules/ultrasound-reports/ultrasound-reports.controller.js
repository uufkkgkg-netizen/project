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
exports.UltrasoundReportsController = void 0;
const common_1 = require("@nestjs/common");
const ultrasound_reports_service_1 = require("./ultrasound-reports.service");
const create_ultrasound_report_dto_1 = require("./dto/create-ultrasound-report.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let UltrasoundReportsController = class UltrasoundReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    create(dto) {
        return this.reportsService.create(dto);
    }
    findAll() {
        return this.reportsService.findAll();
    }
    findByPatient(patientId) {
        return this.reportsService.findByPatient(patientId);
    }
    generatePreview(templateId, patientId) {
        return this.reportsService.generateReportFromTemplate(templateId, patientId);
    }
};
exports.UltrasoundReportsController = UltrasoundReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR, client_1.UserRole.TENANT_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ultrasound_report_dto_1.CreateUltrasoundReportDto]),
    __metadata("design:returntype", void 0)
], UltrasoundReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR, client_1.UserRole.TENANT_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UltrasoundReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR, client_1.UserRole.TENANT_ADMIN),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UltrasoundReportsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)('generate-preview/:templateId/:patientId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR, client_1.UserRole.TENANT_ADMIN),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UltrasoundReportsController.prototype, "generatePreview", null);
exports.UltrasoundReportsController = UltrasoundReportsController = __decorate([
    (0, swagger_1.ApiTags)('Ultrasound Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('ultrasound'),
    __metadata("design:paramtypes", [ultrasound_reports_service_1.UltrasoundReportsService])
], UltrasoundReportsController);
//# sourceMappingURL=ultrasound-reports.controller.js.map