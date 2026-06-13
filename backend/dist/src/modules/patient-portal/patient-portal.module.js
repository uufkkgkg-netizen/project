"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientPortalModule = void 0;
const common_1 = require("@nestjs/common");
const patient_portal_controller_1 = require("./patient-portal.controller");
const patient_portal_service_1 = require("./patient-portal.service");
const jwt_1 = require("@nestjs/jwt");
let PatientPortalModule = class PatientPortalModule {
};
exports.PatientPortalModule = PatientPortalModule;
exports.PatientPortalModule = PatientPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super-secret',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [patient_portal_controller_1.PatientPortalController],
        providers: [patient_portal_service_1.PatientPortalService],
    })
], PatientPortalModule);
//# sourceMappingURL=patient-portal.module.js.map