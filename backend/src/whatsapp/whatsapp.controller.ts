import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('logs')
  getLogs(@Request() req: any) {
    // Only fetch logs for current tenant
    const tenantId = req.user.tenantId;
    return this.whatsappService.getLogs(tenantId);
  }
}
