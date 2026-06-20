import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from './tenant.context';
import { encrypt, decrypt } from '../utils/encryption.util';

// Models that must be scoped to a tenant (all multi-tenant clinical data)
const TENANT_SCOPED_MODELS = new Set([
  'patient', 'appointment', 'medicalRecord',
  'prescription', 'invoice', 'payment', 'ultrasoundReport', 'medicalTemplate', 'visit', 'user'
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    // Force update admin password for testing
    try {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      await this.user.updateMany({
        where: { email: 'admin@gmail.com' },
        data: { passwordHash }
      });
      console.log('Force updated admin password to Admin123!');
    } catch (e) {
      console.error('Failed to force update admin password', e);
    }
    
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
    }).$extends({
      // ── Data Encryption at Rest ──────────────────────────────────────────────
      query: {
        patient: {
          async create({ args, query }) {
            if (args.data.nationalId) args.data.nationalId = encrypt(args.data.nationalId);
            if (args.data.medicalNotes) args.data.medicalNotes = encrypt(args.data.medicalNotes);
            if (args.data.medicalHistory) args.data.medicalHistory = encrypt(args.data.medicalHistory);
            return query(args);
          },
          async update({ args, query }) {
            if (args.data.nationalId && typeof args.data.nationalId === 'string') args.data.nationalId = encrypt(args.data.nationalId);
            if (args.data.medicalNotes && typeof args.data.medicalNotes === 'string') args.data.medicalNotes = encrypt(args.data.medicalNotes);
            if (args.data.medicalHistory && typeof args.data.medicalHistory === 'string') args.data.medicalHistory = encrypt(args.data.medicalHistory);
            return query(args);
          },
          async updateMany({ args, query }) {
            if (args.data.nationalId && typeof args.data.nationalId === 'string') args.data.nationalId = encrypt(args.data.nationalId);
            if (args.data.medicalNotes && typeof args.data.medicalNotes === 'string') args.data.medicalNotes = encrypt(args.data.medicalNotes);
            if (args.data.medicalHistory && typeof args.data.medicalHistory === 'string') args.data.medicalHistory = encrypt(args.data.medicalHistory);
            return query(args);
          },
        },
      },
      result: {
        patient: {
          nationalId: {
            needs: { nationalId: true },
            compute(patient) { return decrypt(patient.nationalId); },
          },
          medicalNotes: {
            needs: { medicalNotes: true },
            compute(patient) { return decrypt(patient.medicalNotes); },
          },
          medicalHistory: {
            needs: { medicalHistory: true },
            compute(patient) { return decrypt(patient.medicalHistory); },
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
