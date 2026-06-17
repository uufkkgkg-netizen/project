import { Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import type { Response, Request } from 'express';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Login (rate-limited: 10 attempts / 60s) ──────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Login — sets HttpOnly cookie + returns token for cross-origin use' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many attempts' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto.email, loginDto.password);

    // Set HttpOnly cookie (XSS-safe — JS cannot read this)
    res.cookie('access_token', result.access_token, COOKIE_OPTIONS);

    // Also return token in body for cross-origin frontends that cannot read HttpOnly cookies
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  // ── Get Current Session (validates cookie or bearer token) ───────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user session info' })
  @ApiResponse({ status: 200, description: 'Returns current user + tenant info' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getMe(@Req() req: Request & { user: any }) {
    return this.authService.getMe(req.user.userId);
  }

  // ── Logout — clear HttpOnly cookie ───────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout — clears HttpOnly auth cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  // ── Register new Clinic/Tenant ────────────────────────────────────────────
  @Post('register')
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new clinic (Tenant)' })
  @ApiResponse({ status: 201, description: 'Clinic registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerTenant(registerDto);
  }
}
