import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsSummaryDto } from './dto/analytics-summary.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard analytics summary' })
  @ApiResponse({ status: 200, type: AnalyticsSummaryDto })
  getSummary(@Request() req): Promise<AnalyticsSummaryDto> {
    return this.analyticsService.getSummary(req.user.tenantId);
  }
}
