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
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const prescriptions_service_1 = require("./prescriptions.service");
const create_prescription_dto_1 = require("./dto/create-prescription.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let PrescriptionsController = class PrescriptionsController {
    prescriptionsService;
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    create(createPrescriptionDto, req) {
        return this.prescriptionsService.create(createPrescriptionDto, req.user.tenantId);
    }
    findAll(req) {
        return this.prescriptionsService.findAll(req.user.tenantId);
    }
    findAllByPatient(patientId, req) {
        return this.prescriptionsService.findAllByPatient(patientId, req.user.tenantId);
    }
    findOne(id, req) {
        return this.prescriptionsService.findOne(id, req.user.tenantId);
    }
    remove(id, req) {
        return this.prescriptionsService.remove(id, req.user.tenantId);
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new prescription' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prescription_dto_1.CreatePrescriptionDto, Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all prescriptions for the clinic' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all prescriptions for a specific patient' }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findAllByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific prescription by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a prescription' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "remove", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Prescriptions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('prescriptions'),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map