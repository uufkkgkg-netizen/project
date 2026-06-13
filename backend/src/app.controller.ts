import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('status')
  async getStatus() {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const usersCount = await prisma.user.count();
      return { status: 'online', usersCount, version: '1.0.2' };
    } catch (e) {
      return { status: 'db_error', error: e.message, version: '1.0.2' };
    } finally {
      await prisma.$disconnect();
    }
  }


}
