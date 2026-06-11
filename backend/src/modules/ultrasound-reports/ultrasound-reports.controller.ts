import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UltrasoundReportsService } from './ultrasound-reports.service';
import { CreateUltrasoundReportDto } from './dto/create-ultrasound-report.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ultrasound Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ultrasound')
export class UltrasoundReportsController {
  constructor(private readonly reportsService: UltrasoundReportsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.TENANT_ADMIN)
  create(@Body() dto: CreateUltrasoundReportDto) {
    return this.reportsService.create(dto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.TENANT_ADMIN)
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.TENANT_ADMIN)
  findByPatient(@Param('patientId') patientId: string) {
    return this.reportsService.findByPatient(patientId);
  }

  @Get('generate-preview/:templateId/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.TENANT_ADMIN)
  generatePreview(
    @Param('templateId') templateId: string,
    @Param('patientId') patientId: string
  ) {
    return this.reportsService.generateReportFromTemplate(templateId, patientId);
  }
}
