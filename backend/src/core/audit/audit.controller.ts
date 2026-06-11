import { Controller, Get, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated audit logs — SUPER_ADMIN only' })
  @ApiQuery({ name: 'action',   required: false })
  @ApiQuery({ name: 'entity',   required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'from',     required: false })
  @ApiQuery({ name: 'to',       required: false })
  @ApiQuery({ name: 'page',     required: false })
  @ApiQuery({ name: 'limit',    required: false })
  findAll(
    @Request() req,
    @Query('action')   action?: string,
    @Query('entity')   entity?: string,
    @Query('tenantId') tenantId?: string,
    @Query('from')     from?: string,
    @Query('to')       to?: string,
    @Query('page')     page = '1',
    @Query('limit')    limit = '50',
  ) {
    // Non-super-admins can only see their own tenant's logs
    const isSuperAdmin = req.user?.isSuperAdmin ?? false;
    const effectiveTenantId = isSuperAdmin
      ? tenantId
      : req.user?.tenantId;

    return this.auditService.findAll({
      tenantId:  effectiveTenantId,
      action,
      entity,
      from:  from  ? new Date(from)  : undefined,
      to:    to    ? new Date(to)    : undefined,
      page:  parseInt(page,  10),
      limit: parseInt(limit, 10),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single audit log with full JSON diff' })
  async findOne(@Param('id') id: string, @Request() req) {
    const log = await this.auditService.findOne(id);
    if (!log) return null;

    // Enforce tenant isolation on single-entry reads too
    const isSuperAdmin = req.user?.isSuperAdmin ?? false;
    if (!isSuperAdmin && log.tenantId !== req.user?.tenantId) {
      throw new ForbiddenException('لا يمكنك الاطلاع على سجلات خارج نطاق عيادتك');
    }
    return log;
  }
}
