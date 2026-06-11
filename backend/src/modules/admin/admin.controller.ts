import {
  Controller, Get, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Super Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('clinics')
  @ApiOperation({ summary: '[Super Admin] List all registered clinics with subscription info' })
  getAllClinics() {
    return this.adminService.getAllClinics();
  }

  @Patch('clinics/:tenantId/subscription')
  @ApiOperation({ summary: '[Super Admin] Update a clinic subscription status and plan' })
  updateSubscription(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    const adminEmail = req.user?.email ?? 'system';
    return this.adminService.updateSubscription(tenantId, dto, adminEmail);
  }

  @Get('clinics/:tenantId/subscription/history')
  @ApiOperation({ summary: '[Super Admin] Get subscription change audit log for a clinic' })
  getSubscriptionHistory(@Param('tenantId') tenantId: string) {
    return this.adminService.getSubscriptionHistory(tenantId);
  }
}
