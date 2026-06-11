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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const audit_service_1 = require("./audit.service");
const PATH_TO_ENTITY = {
    patients: 'PATIENT',
    appointments: 'APPOINTMENT',
    prescriptions: 'PRESCRIPTION',
    billing: 'INVOICE',
    sonar: 'ULTRASOUND',
    staff: 'STAFF',
    users: 'USER',
    auth: 'AUTH',
    admin: 'ADMIN',
    analytics: 'ANALYTICS',
};
const METHOD_TO_ACTION = {
    POST: 'CREATE',
    PATCH: 'UPDATE',
    PUT: 'UPDATE',
    DELETE: 'DELETE',
    GET: 'ACCESS',
};
function extractEntity(path) {
    const segment = path.replace(/^\/api\//, '').split('/')[0];
    return PATH_TO_ENTITY[segment] ?? segment.toUpperCase();
}
function extractEntityId(path) {
    const parts = path.replace(/^\/api\//, '').split('/');
    return parts.length >= 2 ? parts[1] : null;
}
function getClientIp(req) {
    return (req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers?.['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.ip ||
        null);
}
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    auditService;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(auditService) {
        this.auditService = auditService;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const SKIP_GET = process.env.AUDIT_LOG_READS !== 'true';
        if (SKIP_GET && req.method === 'GET')
            return next.handle();
        const path = req.path || req.url || '';
        if (path.includes('/health') || path.includes('/metrics'))
            return next.handle();
        const user = req.user;
        const action = METHOD_TO_ACTION[req.method] ?? req.method;
        const entity = extractEntity(path);
        const entityId = extractEntityId(path);
        const ipAddress = getClientIp(req);
        const userAgent = req.headers?.['user-agent'] ?? null;
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                this.auditService.log({
                    tenantId: user?.tenantId ?? null,
                    userId: user?.userId ?? null,
                    userEmail: user?.email ?? null,
                    action,
                    entity,
                    entityId,
                    ipAddress,
                    userAgent,
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    path,
                    method: req.method,
                });
            },
            error: (err) => {
                this.auditService.log({
                    tenantId: user?.tenantId ?? null,
                    userId: user?.userId ?? null,
                    userEmail: user?.email ?? null,
                    action,
                    entity,
                    entityId,
                    ipAddress,
                    userAgent,
                    statusCode: err?.status ?? 500,
                    path,
                    method: req.method,
                });
            },
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map