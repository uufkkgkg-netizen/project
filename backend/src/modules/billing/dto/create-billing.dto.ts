import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty({ example: 'كشف طبي' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  medicalRecordId?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
