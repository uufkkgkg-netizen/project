"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfGuard = void 0;
const common_1 = require("@nestjs/common");
let CsrfGuard = class CsrfGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
            return true;
        }
        const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
        if (publicPaths.includes(request.path) || publicPaths.includes(request.url.split('?')[0])) {
            return true;
        }
        const csrfCookie = request.cookies?.['csrf_token'];
        const csrfHeader = request.headers['x-csrf-token'] || request.headers['x-xsrf-token'];
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            throw new common_1.ForbiddenException('Invalid CSRF token');
        }
        return true;
    }
};
exports.CsrfGuard = CsrfGuard;
exports.CsrfGuard = CsrfGuard = __decorate([
    (0, common_1.Injectable)()
], CsrfGuard);
//# sourceMappingURL=csrf.guard.js.map