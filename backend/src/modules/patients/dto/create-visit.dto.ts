import { IsString, IsOptional, IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVisitDto {
  @ApiProperty({ example: 'Patient complains of severe headache' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiPropertyOptional({ example: 'Migraine' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Prescribed Ibuprofen' })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  vitals?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateUsed?: string;
}
