import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsObject, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsNotEmpty()
  @IsString()
  medicineName: string;

  @IsNotEmpty()
  @IsString()
  dosage: string;

  @IsNotEmpty()
  @IsString()
  duration: string;
}

export class CreateMedicalRecordDto {
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsNotEmpty()
  @IsString()
  chiefComplaint: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsObject()
  vitals?: any;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescriptionItems?: PrescriptionItemDto[];

  @IsOptional()
  @IsString()
  prescriptionNotes?: string;
}
