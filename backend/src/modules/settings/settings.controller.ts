import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tenant Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get clinic settings (Tenant details)' })
  getSettings(@Request() req) {
    return this.settingsService.getSettings(req.user.tenantId);
  }

  @Patch()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update clinic settings' })
  updateSettings(@Body() dto: UpdateSettingsDto, @Request() req) {
    return this.settingsService.updateSettings(dto, req.user.tenantId);
  }
}
