import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { PatientPortalService, PatientLoginDto } from './patient-portal.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';

@ApiTags('Patient Portal')
@Controller('patient-portal')
export class PatientPortalController {
  constructor(private readonly portalService: PatientPortalService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Login for patients using phone and file number' })
  login(@Body() dto: PatientLoginDto) {
    return this.portalService.login(dto);
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
