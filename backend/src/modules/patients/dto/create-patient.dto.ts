import { IsString, IsOptional, IsDateString, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  // ── Basic Info ─────────────────────────────────────────────────────────────
  @ApiProperty({ example: 'Sarah Ali Mohammad' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '+9647701234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  bloodType?: string;

  // ── Personal & Demographic ─────────────────────────────────────────────────
  @ApiPropertyOptional({ example: '19810101234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nationalId?: string;

  @ApiPropertyOptional({ example: 'married', enum: ['single', 'married', 'divorced', 'widowed'] })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 'Ahmad Mohammad' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  husbandName?: string;

  @ApiPropertyOptional({ example: 'Baghdad, Karada, Street 14' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Ali Mohammad' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '+9647901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContactPhone?: string;

  // ── Medical History ────────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Penicillin, Sulfa' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: 'Hypertension since 2018' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiPropertyOptional({ example: 'Diabetes, Hypertension' })
  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @ApiPropertyOptional({ example: 'C-Section 2020, Appendectomy 2018' })
  @IsOptional()
  @IsString()
  previousSurgeries?: string;

  @ApiPropertyOptional({ example: 'Mother has diabetes' })
  @IsOptional()
  @IsString()
  familyHistory?: string;

  @ApiPropertyOptional({ example: 'Patient prefers female doctors only' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  // ── OB/GYN Fields ─────────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 3, description: 'Gravida — total pregnancies' })
  @IsOptional()
  @IsInt()
  @Min(0)
  gravida?: number;

  @ApiPropertyOptional({ example: 2, description: 'Para — deliveries' })
  @IsOptional()
  @IsInt()
  @Min(0)
  para?: number;

  @ApiPropertyOptional({ example: 1, description: 'Abortus — miscarriages/abortions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  abortus?: number;

  @ApiPropertyOptional({ example: 2, description: 'Living children' })
  @IsOptional()
  @IsInt()
  @Min(0)
  livingChildren?: number;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Last Menstrual Period' })
  @IsOptional()
  @IsDateString()
  lastMenstrualPeriod?: string;

  @ApiPropertyOptional({ example: '2025-10-08', description: 'Estimated Due Date' })
  @IsOptional()
  @IsDateString()
  estimatedDueDate?: string;

  @ApiPropertyOptional({ example: '28 weeks + 3 days' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gestationalAge?: string;

  @ApiPropertyOptional({ example: 'IUD', enum: ['none', 'pills', 'iud', 'injection', 'implant', 'condom', 'other'] })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contraceptiveMethod?: string;
}
