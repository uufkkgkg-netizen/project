import {
  Controller, Get, Post, Body, Param, Patch, UseGuards, Request,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-billing.dto';
import { RecordPaymentDto } from './dto/update-billing.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Billing & Invoicing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@Body() dto: CreateInvoiceDto, @Request() req) {
    return this.billingService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all invoices for this clinic' })
  findAll() {
    return this.billingService.findAll();
  }

  @Get('summary')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get billing summary stats' })
  getSummary() {
    return this.billingService.getSummary();
  }

  @Get('patient/:patientId')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all invoices for a specific patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.billingService.findByPatient(patientId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get a single invoice with all payments' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post(':id/payments')
  @Roles(UserRole.TENANT_ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Record a payment for an invoice (auto-updates status)' })
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.billingService.recordPayment(id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Cancel an invoice' })
  cancel(@Param('id') id: string) {
    return this.billingService.cancel(id);
  }
}
