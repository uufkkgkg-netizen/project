import { IsString, IsOptional, IsDateString, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Sarah Ali' })
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

  @ApiPropertyOptional({ example: 'No known allergies.' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiPropertyOptional({ example: 'Penicillin' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: 'Hypertension, Diabetes Type 2' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  // --- OB/GYN Fields ---
  @ApiPropertyOptional({ example: 3, description: 'Gravida - total number of pregnancies' })
  @IsOptional()
  @IsInt()
  @Min(0)
  gravida?: number;

  @ApiPropertyOptional({ example: 2, description: 'Para - number of deliveries' })
  @IsOptional()
  @IsInt()
  @Min(0)
  para?: number;

  @ApiPropertyOptional({ example: 1, description: 'Abortus - number of abortions/miscarriages' })
  @IsOptional()
  @IsInt()
  @Min(0)
  abortus?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of living children' })
  @IsOptional()
  @IsInt()
  @Min(0)
  livingChildren?: number;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Last Menstrual Period date' })
  @IsOptional()
  @IsDateString()
  lastMenstrualPeriod?: string;

  @ApiPropertyOptional({ example: '2025-10-08', description: 'Estimated Due Date' })
  @IsOptional()
  @IsDateString()
  estimatedDueDate?: string;

  @ApiPropertyOptional({ example: '28 weeks', description: 'Gestational age' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gestationalAge?: string;

  @ApiPropertyOptional({ example: 'IUD', description: 'Contraceptive method' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contraceptiveMethod?: string;

  @ApiPropertyOptional({ example: 'C-Section 2020' })
  @IsOptional()
  @IsString()
  previousSurgeries?: string;

  @ApiPropertyOptional({ example: 'Diabetes, Hypertension' })
  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @ApiPropertyOptional({ example: 'Mother has diabetes' })
  @IsOptional()
  @IsString()
  familyHistory?: string;
}
