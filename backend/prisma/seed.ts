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
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Load .env (needed when running seed script directly outside NestJS DI)
import * as dotenv from 'dotenv';
dotenv.config();

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
const prisma = new PrismaClient();

function generateSecurePassword() {
  return crypto.randomBytes(12).toString('base64').replace(/\W/g, '') + 'A1!';
}

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
  console.log('\n▶  Seeding Super Admin account…');
  const superAdminPassword = generateSecurePassword();
  const superAdminHash = await bcrypt.hash(superAdminPassword, 12);
  const user = await prisma.user.upsert({
    where:  { email: 'admin@gmail.com' },
    create: {
      firstName:    'Super',
      lastName:     'Admin',
      email:        'admin@gmail.com',
      passwordHash: superAdminHash,
      role:         UserRole.SUPER_ADMIN,
      tenantId:     tenant.id,
      isActive:     true,
    },
    update: { firstName: 'Super', lastName: 'Admin', tenantId: tenant.id, role: UserRole.SUPER_ADMIN },
  });
  console.log(`   ✅  Super Admin: ${user.firstName} ${user.lastName} <${user.email}>`);
  console.log(`   🔑  PASSWORD: ${superAdminPassword}`);
  console.log(`   ⚠️  Please save this password NOW. It will not be printed again.`);

  // ── 3. Seed Tenant Admin ──────────────────────────────────────
  console.log('\n▶  Seeding Tenant Admin account…');
  const taPassword = generateSecurePassword();
  const taPasswordHash = await bcrypt.hash(taPassword, 12);
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
  console.log(`   🔑  PASSWORD: ${taPassword}`);

  // ── 4. Seed Doctor ──────────────────────────────────────
  console.log('\n▶  Seeding Doctor account…');
  const docPassword = generateSecurePassword();
  const docPasswordHash = await bcrypt.hash(docPassword, 12);
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
  console.log(`   🔑  PASSWORD: ${docPassword}`);

  console.log('\n✨  Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
