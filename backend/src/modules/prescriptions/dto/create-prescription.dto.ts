import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class PrescriptionItemDto {
  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  duration: string;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsOptional()
  medicalRecordId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
