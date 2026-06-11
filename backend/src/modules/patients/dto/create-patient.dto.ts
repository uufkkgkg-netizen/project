import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
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
}
