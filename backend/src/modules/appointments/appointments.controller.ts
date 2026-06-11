import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user.tenantId);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user.role, req.user.userId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.findOne(id, req.user.role, req.user.userId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, req.user.role, req.user.userId);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  remove(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.remove(id, req.user.role, req.user.userId);
  }
}
