import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Root info' })
  getRoot() {
    return {
      status: 'ok',
      service: 'FemCare API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PRE-1 / CAUSE-2: Liveness check — process-only, NO DB query.
   * Render probes this every 30s. If this queries the DB it exhausts the free PG connection pool.
   * Rule: /health MUST return 200 within 200ms with zero external calls.
   */
  @Get('health')
  @ApiOperation({ summary: 'Liveness check — process only, no DB' })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PRE-2 / CAUSE-2: Readiness check — DB ping with 5s timeout.
   * Returns 200 {status:"ready",db:"up"} when healthy.
   * Returns 503 {status:"not_ready",db:"down"} on DB failure.
   * Render healthCheckPath points HERE (not /health).
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check — DB ping with 5s timeout' })
  async getReady() {
    try {
      // 5-second timeout for DB ping
      const dbPing = this.prisma.$queryRaw`SELECT 1 AS ping`;
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 5000),
      );
      await Promise.race([dbPing, timeout]);

      return {
        status: 'ready',
        db: 'up',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'not_ready',
          db: 'down',
          error: error instanceof Error ? error.message : 'Unknown DB error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

