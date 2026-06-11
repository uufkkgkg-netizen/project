import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { MedicalTemplatesService } from './medical-templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

type TemplateCategory = 'ULTRASOUND' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'GENERAL';
const TEMPLATE_CATEGORIES = ['ULTRASOUND', 'DIAGNOSIS', 'PRESCRIPTION', 'FOLLOW_UP', 'GENERAL'];

@ApiTags('Medical Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('templates')
export class MedicalTemplatesController {
  constructor(private readonly service: MedicalTemplatesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'List all active templates (optionally filtered by category)' })
  @ApiQuery({ name: 'category', required: false, enum: TEMPLATE_CATEGORIES })
  findAll(@Query('category') category?: TemplateCategory) {
    return this.service.findAll(category);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get a single template by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create a new clinical template' })
  create(@Body() dto: CreateTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update a template (title, category, content, or active status)' })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Soft-delete a template (sets isActive = false)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
