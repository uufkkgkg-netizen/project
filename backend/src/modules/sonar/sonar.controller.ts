import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SonarService } from './sonar.service';
import { CreateSonarDto } from './dto/create-sonar.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sonar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sonar')
export class SonarController {
  constructor(private readonly sonarService: SonarService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ultrasound report' })
  create(@Body() createSonarDto: CreateSonarDto, @Request() req) {
    return this.sonarService.create(createSonarDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ultrasound reports for the clinic' })
  findAll(@Request() req) {
    return this.sonarService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific ultrasound report by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.sonarService.findOne(id, req.user.tenantId);
  }
}
