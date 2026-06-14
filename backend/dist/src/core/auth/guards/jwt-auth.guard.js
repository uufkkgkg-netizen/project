"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const tenant_context_1 = require("../../prisma/tenant.context");
const rxjs_1 = require("rxjs");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    canActivate(context) {
        return new Promise((resolve, reject) => {
            const activate = super.canActivate(context);
            const result = activate instanceof rxjs_1.Observable
                ? activate.toPromise()
                : Promise.resolve(activate);
            result.then((valid) => {
                if (!valid)
                    return resolve(false);
                const req = context.switchToHttp().getRequest();
                const user = req.user;
                if (!user)
                    return resolve(false);
                tenant_context_1.TenantContext.run({ tenantId: user.tenantId, isSuperAdmin: user.isSuperAdmin }, () => resolve(true));
            }).catch(reject);
        });
    }
    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map