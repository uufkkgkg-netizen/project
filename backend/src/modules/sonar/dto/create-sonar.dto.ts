import { IsNotEmpty, IsString, IsArray, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSonarDto {
  @ApiProperty({ description: 'The ID of the patient' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'The date of the ultrasound report' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'The clinical findings of the ultrasound' })
  @IsNotEmpty()
  @IsString()
  findings: string;

  @ApiProperty({ description: 'Array of image URLs for the ultrasound', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
