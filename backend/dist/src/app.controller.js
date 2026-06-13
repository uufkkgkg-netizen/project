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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async seedDb() {
        const { PrismaClient } = require('@prisma/client');
        const bcrypt = require('bcrypt');
        const prisma = new PrismaClient();
        try {
            const tenant = await prisma.tenant.upsert({
                where: { subdomain: 'main' },
                create: { name: 'FemCare Clinic Main', subdomain: 'main', isActive: true },
                update: {},
            });
            const passwordHash = await bcrypt.hash('123456', 12);
            await prisma.user.upsert({
                where: { email: 'admin@gmail.com' },
                create: { firstName: 'Super', lastName: 'Admin', email: 'admin@gmail.com', passwordHash, role: 'SUPER_ADMIN', tenantId: tenant.id, isActive: true },
                update: { passwordHash, role: 'SUPER_ADMIN' },
            });
            await prisma.user.upsert({
                where: { email: 'clinic@gmail.com' },
                create: { firstName: 'Clinic', lastName: 'Admin', email: 'clinic@gmail.com', passwordHash, role: 'TENANT_ADMIN', tenantId: tenant.id, isActive: true },
                update: { passwordHash, role: 'TENANT_ADMIN' },
            });
            await prisma.user.upsert({
                where: { email: 'doctor@gmail.com' },
                create: { firstName: 'Doctor', lastName: 'Ahmad', email: 'doctor@gmail.com', passwordHash, role: 'DOCTOR', tenantId: tenant.id, isActive: true },
                update: { passwordHash, role: 'DOCTOR' },
            });
            return { success: true, message: 'Seeded successfully' };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
        finally {
            await prisma.$disconnect();
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "seedDb", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map