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
exports.SonarController = void 0;
const common_1 = require("@nestjs/common");
const sonar_service_1 = require("./sonar.service");
const create_sonar_dto_1 = require("./dto/create-sonar.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let SonarController = class SonarController {
    sonarService;
    constructor(sonarService) {
        this.sonarService = sonarService;
    }
    create(createSonarDto, req) {
        return this.sonarService.create(createSonarDto, req.user.tenantId);
    }
    findAll(req) {
        return this.sonarService.findAll(req.user.tenantId);
    }
    findOne(id, req) {
        return this.sonarService.findOne(id, req.user.tenantId);
    }
};
exports.SonarController = SonarController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new ultrasound report' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sonar_dto_1.CreateSonarDto, Object]),
    __metadata("design:returntype", void 0)
], SonarController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ultrasound reports for the clinic' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SonarController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific ultrasound report by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SonarController.prototype, "findOne", null);
exports.SonarController = SonarController = __decorate([
    (0, swagger_1.ApiTags)('Sonar'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sonar'),
    __metadata("design:paramtypes", [sonar_service_1.SonarService])
], SonarController);
//# sourceMappingURL=sonar.controller.js.map