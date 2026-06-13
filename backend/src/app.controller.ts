import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('seed')
  async seedDb() {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcrypt');
    const prisma = new PrismaClient();
    try {
      const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'main' },
        create: { name: 'FemCare Clinic Main', subdomain: 'main', isActive: true },
        update: {},
      });

      const passwordHash = await bcrypt.hash('123456', 12);
      await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        create: { firstName: 'Super', lastName: 'Admin', email: 'admin@gmail.com', passwordHash, role: 'SUPER_ADMIN', tenantId: tenant.id, isActive: true },
        update: { passwordHash, role: 'SUPER_ADMIN' },
      });

      await prisma.user.upsert({
        where: { email: 'clinic@gmail.com' },
        create: { firstName: 'Clinic', lastName: 'Admin', email: 'clinic@gmail.com', passwordHash, role: 'TENANT_ADMIN', tenantId: tenant.id, isActive: true },
        update: { passwordHash, role: 'TENANT_ADMIN' },
      });

      await prisma.user.upsert({
        where: { email: 'doctor@gmail.com' },
        create: { firstName: 'Doctor', lastName: 'Ahmad', email: 'doctor@gmail.com', passwordHash, role: 'DOCTOR', tenantId: tenant.id, isActive: true },
        update: { passwordHash, role: 'DOCTOR' },
      });

      return { success: true, message: 'Seeded successfully' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      await prisma.$disconnect();
    }
  }
}
