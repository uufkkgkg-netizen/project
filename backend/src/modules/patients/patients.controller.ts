import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateVisitDto } from './dto/create-visit.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create a new patient' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get all patients for the current clinic' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get a specific patient by ID with full history' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update a patient basic info' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  // --- VISITS ---

  @Post(':id/visits')
  @Roles('SUPER_ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create a new clinical visit/encounter for a patient' })
  createVisit(@Param('id') id: string, @Body() createVisitDto: CreateVisitDto) {
    return this.patientsService.createVisit(id, createVisitDto);
  }

  // --- CENTRAL MEDICAL RECORDS ---

  @Get('visits/all')
  @Roles('SUPER_ADMIN', 'DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get all visits across all patients (central medical records)' })
  findAllVisits(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.patientsService.findAllVisits(search, page ? +page : 1, limit ? +limit : 50);
  }
}

