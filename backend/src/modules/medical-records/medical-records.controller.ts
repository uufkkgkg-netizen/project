import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  create(@Body() createDto: CreateMedicalRecordDto, @Request() req) {
    return this.medicalRecordsService.create(createDto, req.user.tenantId);
  }

  @Get('patient/:patientId')
  findAllByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordsService.findAllByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }
}
