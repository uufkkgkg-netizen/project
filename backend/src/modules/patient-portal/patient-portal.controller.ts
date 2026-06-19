import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { PatientPortalService, PatientLoginDto } from './patient-portal.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';

@ApiTags('Patient Portal')
@Controller('patient-portal')
export class PatientPortalController {
  constructor(private readonly portalService: PatientPortalService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Login for patients using phone and file number' })
  async login(@Body() dto: PatientLoginDto, @Res({ passthrough: true }) res) {
    const result = await this.portalService.login(dto);
    
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('portal_access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    return { patient: result.patient };
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout for patients' })
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('portal_access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient dashboard data' })
  getDashboard(@Request() req) {
    // The JWT Guard sets req.user to the payload
    // We should ensure only role PATIENT can access this, though we can check it here or with RolesGuard
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    return this.portalService.getDashboardData(req.user.patientId);
  }
}
