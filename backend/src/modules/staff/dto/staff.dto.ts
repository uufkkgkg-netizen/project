import {
  IsString, IsEmail, IsNotEmpty, IsOptional, IsIn, MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@prisma/client';

export const ASSIGNABLE_ROLES = [UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT, UserRole.NURSE];

export class CreateStaffDto {
  @ApiProperty({ example: 'Sara' })
  @IsString() @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Ahmad' })
  @IsString() @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'sara.ahmad@clinic.com' })
  @IsEmail() @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+9647xxxxxxxxx', required: false })
  @IsOptional() @IsString()
  phone?: string;

  @ApiProperty({ example: UserRole.DOCTOR, enum: UserRole })
  @IsString() @IsNotEmpty()
  @IsIn(Object.values(UserRole), { message: 'الدور المحدد غير مسموح به' })
  role: UserRole;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString() @IsNotEmpty() @MinLength(8)
  password: string;
}

export class UpdateStaffRoleDto {
  @ApiProperty({ example: UserRole.RECEPTIONIST, enum: UserRole })
  @IsString() @IsNotEmpty()
  @IsIn(Object.values(UserRole), { message: 'الدور المحدد غير مسموح به' })
  role: UserRole;
}
