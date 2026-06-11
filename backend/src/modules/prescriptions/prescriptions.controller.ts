import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Request() req) {
    return this.prescriptionsService.create(createPrescriptionDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions for the clinic' })
  findAll(@Request() req) {
    return this.prescriptionsService.findAll(req.user.tenantId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all prescriptions for a specific patient' })
  findAllByPatient(@Param('patientId') patientId: string, @Request() req) {
    return this.prescriptionsService.findAllByPatient(patientId, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific prescription by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.prescriptionsService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prescription' })
  remove(@Param('id') id: string, @Request() req) {
    return this.prescriptionsService.remove(id, req.user.tenantId);
  }
}
