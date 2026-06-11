import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
