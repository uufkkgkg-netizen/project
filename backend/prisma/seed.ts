/**
 * FemCare Database Seeder
 * Seeds: Default Super Admin accounts and Tenant
 *
 * Run with:  npx ts-node -P tsconfig.json prisma/seed.ts
 *       or:  npm run db:seed
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Load .env (needed when running seed script directly outside NestJS DI)
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const SUPER_ADMINS = [
  {
    firstName:  'Super',
    lastName:   'Admin',
    email:      'admin@gmail.com',
    password:   '123456',
  },
  {
    firstName:  'Super',
    lastName:   'Admin 2',
    email:      'admahn@gmail.com',
    password:   '123456',
  },
];

async function main() {
  console.log('🌱  FemCare Seeder started…\n');

  // ── 1. Seed Default Tenant ──────────────────────────────────────
  console.log('\n▶  Seeding Default Tenant…');
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'main' },
    create: {
      name: 'FemCare Clinic Main',
      subdomain: 'main',
      isActive: true,
    },
    update: {},
  });
  console.log(`   ✅  Tenant: ${tenant.name}`);

  // ── 2. Seed Super Admin users ─────────────────────────────────
  console.log('\n▶  Seeding Super Admin accounts…');
  for (const admin of SUPER_ADMINS) {
    const passwordHash = await bcrypt.hash(admin.password, 12);
    const user = await prisma.user.upsert({
      where:  { email: admin.email },
      create: {
        firstName:    admin.firstName,
        lastName:     admin.lastName,
        email:        admin.email,
        passwordHash,
        role:         UserRole.SUPER_ADMIN,
        tenantId:     tenant.id,   // Assign to default tenant
        isActive:     true,
      },
      update: { firstName: admin.firstName, lastName: admin.lastName, tenantId: tenant.id, role: UserRole.SUPER_ADMIN },
    });
    console.log(`   ✅  Super Admin: ${user.firstName} ${user.lastName} <${user.email}>`);
  }

  // ── 3. Seed Tenant Admin ──────────────────────────────────────
  console.log('\n▶  Seeding Tenant Admin account…');
  const taPasswordHash = await bcrypt.hash('123456', 12);
  const taUser = await prisma.user.upsert({
    where:  { email: 'clinic@gmail.com' },
    create: {
      firstName:    'Clinic',
      lastName:     'Admin',
      email:        'clinic@gmail.com',
      passwordHash: taPasswordHash,
      role:         UserRole.TENANT_ADMIN,
      tenantId:     tenant.id,
      isActive:     true,
    },
    update: { tenantId: tenant.id, role: UserRole.TENANT_ADMIN },
  });
  console.log(`   ✅  Tenant Admin: ${taUser.firstName} ${taUser.lastName} <${taUser.email}>`);

  // ── 4. Seed Doctor ──────────────────────────────────────
  console.log('\n▶  Seeding Doctor account…');
  const docPasswordHash = await bcrypt.hash('123456', 12);
  const docUser = await prisma.user.upsert({
    where:  { email: 'doctor@gmail.com' },
    create: {
      firstName:    'Doctor',
      lastName:     'Ahmad',
      email:        'doctor@gmail.com',
      passwordHash: docPasswordHash,
      role:         UserRole.DOCTOR,
      tenantId:     tenant.id,
      isActive:     true,
    },
    update: { tenantId: tenant.id, role: UserRole.DOCTOR },
  });
  console.log(`   ✅  Doctor: ${docUser.firstName} ${docUser.lastName} <${docUser.email}>`);

  console.log('\n✨  Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
