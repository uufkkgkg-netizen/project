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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax'),
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
};
const REFRESH_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
const CSRF_COOKIE_OPTIONS = {
    httpOnly: false,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax'),
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
};
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto, req, res) {
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const result = await this.authService.login(loginDto.email, loginDto.password, ip, userAgent);
        res.cookie('access_token', result.access_token, COOKIE_OPTIONS);
        res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
        res.cookie('csrf_token', result.csrfToken, CSRF_COOKIE_OPTIONS);
        return {
            user: result.user,
        };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('No refresh token provided');
        }
        const ip = req.ip || req.socket.remoteAddress;
        const result = await this.authService.refreshToken(refreshToken, ip);
        res.cookie('access_token', result.access_token, COOKIE_OPTIONS);
        res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
        res.cookie('csrf_token', result.csrfToken, CSRF_COOKIE_OPTIONS);
        return {
            user: result.user,
        };
    }
    async getMe(req) {
        return this.authService.getMe(req.user.userId);
    }
    async logout(req, res) {
        const refreshToken = req.cookies['refresh_token'];
        await this.authService.logout(refreshToken);
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        res.clearCookie('csrf_token', { path: '/' });
        return { message: 'Logged out successfully' };
    }
    async logoutAll(req, res) {
        await this.authService.logoutAll(req.user.userId);
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        res.clearCookie('csrf_token', { path: '/' });
        return { message: 'Logged out from all devices successfully' };
    }
    async register(registerDto) {
        return this.authService.registerTenant(registerDto);
    }
    async seedProductionDb(req) {
        if (process.env.NODE_ENV === 'production') {
            throw new common_1.NotFoundException();
        }
        if (req.user?.role !== 'SUPER_ADMIN') {
            throw new common_1.UnauthorizedException('SUPER_ADMIN role required');
        }
        return this.authService.seedDatabase();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ auth: { ttl: 60000, limit: 10 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Login — sets cookies + returns tokens' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using HttpOnly cookie' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current session info' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout — clears cookies and revokes refresh token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ auth: { ttl: 60000, limit: 5 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new clinic' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Seed database — SUPER_ADMIN only, non-production only' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "seedProductionDb", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map