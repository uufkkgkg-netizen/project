import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

type TemplateCategory = 'ULTRASOUND' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'GENERAL';
const TEMPLATE_CATEGORIES = ['ULTRASOUND', 'DIAGNOSIS', 'PRESCRIPTION', 'FOLLOW_UP', 'GENERAL'] as const;

export class CreateTemplateDto {
  @IsNotEmpty({ message: 'عنوان القالب مطلوب' })
  @IsString()
  @MinLength(3)
  title: string;

  @IsEnum(TEMPLATE_CATEGORIES, { message: 'التصنيف غير صالح' })
  category: TemplateCategory;

  @IsNotEmpty({ message: 'محتوى القالب مطلوب' })
  @IsString()
  content: string;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsEnum(TEMPLATE_CATEGORIES)
  category?: TemplateCategory;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  isActive?: boolean;
}
