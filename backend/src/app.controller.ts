import { Controller, Get, Res, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';
import type { Response } from 'express';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Root health check' })
  getRoot() {
    return {
      status: 'ok',
      service: 'FemCare API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Liveness check endpoint for load balancers' })
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (DB + Services)' })
  async getReady() {
    try {
      // Ping DB
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        db: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        message: 'Database not ready',
        timestamp: new Date().toISOString(),
      }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
