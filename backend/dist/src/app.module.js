"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./core/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const patients_module_1 = require("./modules/patients/patients.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const medical_records_module_1 = require("./modules/medical-records/medical-records.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const prescriptions_module_1 = require("./modules/prescriptions/prescriptions.module");
const billing_module_1 = require("./modules/billing/billing.module");
const sonar_module_1 = require("./modules/sonar/sonar.module");
const admin_module_1 = require("./modules/admin/admin.module");
const staff_module_1 = require("./modules/staff/staff.module");
const audit_module_1 = require("./core/audit/audit.module");
const medical_templates_module_1 = require("./modules/medical-templates/medical-templates.module");
const tenant_interceptor_1 = require("./core/prisma/tenant.interceptor");
const ultrasound_reports_module_1 = require("./modules/ultrasound-reports/ultrasound-reports.module");
const settings_module_1 = require("./modules/settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, audit_module_1.AuditModule, auth_module_1.AuthModule, patients_module_1.PatientsModule, appointments_module_1.AppointmentsModule, medical_records_module_1.MedicalRecordsModule, analytics_module_1.AnalyticsModule, prescriptions_module_1.PrescriptionsModule, billing_module_1.BillingModule, sonar_module_1.SonarModule, admin_module_1.AdminModule, staff_module_1.StaffModule, medical_templates_module_1.MedicalTemplatesModule, ultrasound_reports_module_1.UltrasoundReportsModule, settings_module_1.SettingsModule],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: tenant_interceptor_1.TenantInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map