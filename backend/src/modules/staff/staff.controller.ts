import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffRoleDto } from './dto/staff.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Staff Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'List all staff for this clinic (or all clinics if SUPER_ADMIN)' })
  findAll(@Request() req) {
    return this.staffService.findAll(req.user.tenantId, req.user.isSuperAdmin ?? false);
  }

  @Post()
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new staff member (non-admins cannot assign SUPER_ADMIN role)' })
  create(@Body() dto: CreateStaffDto, @Request() req) {
    return this.staffService.create(dto, req.user.tenantId, req.user.isSuperAdmin ?? false);
  }

  @Patch(':id/role')
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update a staff member role (SUPER_ADMIN role is restricted to SUPER_ADMINs only)' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateStaffRoleDto,
    @Request() req,
  ) {
    return this.staffService.updateRole(id, dto, req.user.tenantId, req.user.isSuperAdmin ?? false);
  }

  @Patch(':id/status')
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Toggle staff account active/suspended status' })
  toggleStatus(@Param('id') id: string, @Request() req) {
    return this.staffService.toggleStatus(id, req.user.tenantId, req.user.isSuperAdmin ?? false);
  }
}
