import { IsString, IsOptional, IsUrl, IsNumber, IsBoolean, IsArray, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  // ── Tenant Basic Info ───────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contactPhone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contactEmail?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() defaultCurrency?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUrl() logoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() primaryColor?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() accentColor?: string;

  // ── TenantSettings (General & Financial) ────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() timezone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() language?: string;
  @ApiProperty({ required: false }) @IsOptional() taxRate?: any;
  @ApiProperty({ required: false }) @IsOptional() @IsString() invoicePrefix?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() invoiceStartNumber?: number;

  // ── Operations & Appointments ───────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsArray() workingDays?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() workStartTime?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() workEndTime?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() appointmentDuration?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() appointmentBuffer?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() maxDailyAppointments?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() noShowPolicy?: string;

  // ── Print & Identity ────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() doctorName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() doctorSpecialty?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() licenseNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() printHeader?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() printFooter?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUrl() stampImageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUrl() signatureImageUrl?: string;

  // ── Notifications ───────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() whatsappEnabled?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() reminderHoursBefore?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() quietHoursStart?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() quietHoursEnd?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() sendConfirmation?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() sendReminder?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() sendAfterVisit?: boolean;

  // ── Security ────────────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sessionDurationMins?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() require2FA?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() passwordMinLength?: number;
}
