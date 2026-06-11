import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
