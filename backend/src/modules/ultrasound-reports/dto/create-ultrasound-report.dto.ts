import { IsString, IsOptional, IsObject, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUltrasoundReportDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ example: 'Normal fetal growth...' })
  @IsString()
  findings: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  measurements?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
