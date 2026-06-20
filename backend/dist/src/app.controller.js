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
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./core/prisma/prisma.service");
let AppController = class AppController {
    appService;
    prisma;
    constructor(appService, prisma) {
        this.appService = appService;
        this.prisma = prisma;
    }
    getRoot() {
        return {
            status: 'ok',
            service: 'FemCare API',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
        };
    }
    getHealth() {
        return {
            status: 'ok',
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
        };
    }
    async getReady() {
        try {
            const dbPing = this.prisma.$queryRaw `SELECT 1 AS ping`;
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000));
            await Promise.race([dbPing, timeout]);
            return {
                status: 'ready',
                db: 'up',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'not_ready',
                db: 'down',
                error: error instanceof Error ? error.message : 'Unknown DB error',
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Root info' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness check — process only, no DB' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness check — DB ping with 5s timeout' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getReady", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map