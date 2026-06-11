import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'New subscription status', enum: ['trial', 'active', 'suspended', 'canceled'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['trial', 'active', 'suspended', 'canceled'])
  status: string;

  @ApiProperty({ description: 'New subscription plan', enum: ['basic', 'professional', 'enterprise'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['basic', 'professional', 'enterprise'])
  plan: string;

  @ApiProperty({ description: 'Optional reason for the change', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
