import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from './tenant.context';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Models that must be scoped to a tenant (all multi-tenant clinical data)
const TENANT_SCOPED_MODELS = new Set([
  'patient', 'appointment', 'medicalRecord',
  'prescription', 'invoice', 'payment', 'ultrasoundReport', 'medicalTemplate', 'visit', 'user'
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
   super();
  }

  async onModuleInit() {
    await this.$connect();
    
    // Auto-seed on startup if db is empty
    try {
      const adminExists = await this.user.findUnique({ where: { email: 'admin@gmail.com' } });
      if (!adminExists) {
        const bcrypt = require('bcryptjs');
        
        const tenant = await this.tenant.upsert({
          where: { subdomain: 'main' },
          create: { name: 'FemCare Clinic Main', subdomain: 'main', isActive: true },
          update: {},
        });

        const passwordHash = await bcrypt.hash('123456', 12);
        
        await this.user.upsert({
          where: { email: 'admin@gmail.com' },
          create: { firstName: 'Super', lastName: 'Admin', email: 'admin@gmail.com', passwordHash, role: 'SUPER_ADMIN', tenantId: tenant.id, isActive: true },
          update: { passwordHash, role: 'SUPER_ADMIN' },
        });

        await this.user.upsert({
          where: { email: 'clinic@gmail.com' },
          create: { firstName: 'Clinic', lastName: 'Admin', email: 'clinic@gmail.com', passwordHash, role: 'TENANT_ADMIN', tenantId: tenant.id, isActive: true },
          update: { passwordHash, role: 'TENANT_ADMIN' },
        });

        await this.user.upsert({
          where: { email: 'doctor@gmail.com' },
          create: { firstName: 'Doctor', lastName: 'Ahmad', email: 'doctor@gmail.com', passwordHash, role: 'DOCTOR', tenantId: tenant.id, isActive: true },
          update: { passwordHash, role: 'DOCTOR' },
        });
        
        console.log('Database auto-seeded successfully on startup.');
      }
    } catch (e) {
      console.error('Auto-seed failed:', e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // ── Tenant-Scoped Extension (Application-Level Isolation) ─────────────────
  //
  // This Prisma Client Extension automatically injects `where: { tenantId }`
  // into every findMany/findFirst/findUnique/update/delete on tenant-scoped models.
  // SUPER_ADMIN users bypass this filter entirely.
  //
  // Usage: services use `this.prisma.scoped` instead of `this.prisma`
  // to get automatic tenant isolation without any manual where clauses.
  get scoped() {
    const store = TenantContext.getStore();
    const tenantId     = store?.tenantId     ?? null;
    const isSuperAdmin = store?.isSuperAdmin ?? false;

    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
            const isTenantModel = TENANT_SCOPED_MODELS.has(modelKey);

            // Super Admins bypass all tenant filters
            if (isSuperAdmin || !isTenantModel || !tenantId) {
              return query(args);
            }

            // Inject tenantId automatically into WHERE clauses
            if (['findMany', 'findFirst', 'count', 'aggregate'].includes(operation)) {
              const a = args as any;
              args = { ...args, where: { ...a.where, tenantId } };
            }

            if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              const a = args as any;
              args = { ...args, where: { ...a.where, tenantId } };
            }

            if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
              // findUnique uses `where: { id }` — convert to findFirst with tenantId
              const a = args as any;
              const { where, ...rest } = a;
              return (this as any).findFirst({ ...rest, where: { ...where, tenantId } });
            }

            return query(args);
          },
        },
      },
    });
  }

  // ── Legacy RLS getter (kept for backward compat) ──────────────────────────
  // Uses PostgreSQL set_config to enforce RLS policies at DB level.
  get rls() {
    const store = TenantContext.getStore();
    const tenantId     = store?.tenantId    || '';
    const isSuperAdmin = store?.isSuperAdmin ? 'true' : 'false';

    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await this.$transaction([
              this.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', '${tenantId}', TRUE)`),
              this.$executeRawUnsafe(`SELECT set_config('app.is_super_admin', '${isSuperAdmin}', TRUE)`),
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }
}
