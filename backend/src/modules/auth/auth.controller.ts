import { Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UseGuards, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import type { Response, Request } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// CSRF cookie is NOT httpOnly so the frontend can read it and send it in headers
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Login — sets cookies + returns tokens' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using HttpOnly cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current session info' })
  async getMe(@Req() req: Request & { user: any }) {
    return this.authService.getMe(req.user.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout — clears cookies and revokes refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    await this.authService.logout(refreshToken);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });

    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@Req() req: Request & { user: any }, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(req.user.userId);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });

    return { message: 'Logged out from all devices successfully' };
  }

  @Post('register')
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new clinic' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerTenant(registerDto);
  }

  // ── Seed Endpoint — SUPER_ADMIN only, non-production only ─────────────────
  // CAUSE-5 fix: was public GET /auth/seed — now POST + guarded.
  // In production this route returns 404 (not 403) to prevent route enumeration.
  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed database — SUPER_ADMIN only, non-production only' })
  async seedProductionDb(@Req() req: Request & { user: any }) {
    if (process.env.NODE_ENV === 'production') {
      // Return 404 (not 403) to prevent route enumeration in production
      throw new NotFoundException();
    }
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('SUPER_ADMIN role required');
    }
    return this.authService.seedDatabase();
  }
}
