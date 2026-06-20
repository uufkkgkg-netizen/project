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
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
function cookieOrBearerExtractor(req) {
    if (req?.cookies?.access_token) {
        return req.cookies.access_token;
    }
    if (req?.cookies?.portal_access_token) {
        return req.cookies.portal_access_token;
    }
    const authHeader = req?.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.length < 32) {
            console.error('FATAL: JWT_SECRET is missing or shorter than 32 characters. Exiting with code 1.');
            process.exit(1);
        }
        super({
            jwtFromRequest: cookieOrBearerExtractor,
            ignoreExpiration: false,
            secretOrKey: secret,
            passReqToCallback: false,
        });
    }
    async validate(payload) {
        if (!payload?.sub) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            role: payload.role,
            isSuperAdmin: payload.isSuperAdmin ?? false,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map