"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
function generateSecurePassword() {
    return crypto.randomBytes(12).toString('base64').replace(/\W/g, '') + 'A1!';
}
async function main() {
    console.log('🌱  FemCare Seeder started…\n');
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
    console.log('\n▶  Seeding Super Admin account…');
    const superAdminPassword = generateSecurePassword();
    const superAdminHash = await bcrypt.hash(superAdminPassword, 12);
    const user = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        create: {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@gmail.com',
            passwordHash: superAdminHash,
            role: client_1.UserRole.SUPER_ADMIN,
            tenantId: tenant.id,
            isActive: true,
        },
        update: { firstName: 'Super', lastName: 'Admin', tenantId: tenant.id, role: client_1.UserRole.SUPER_ADMIN },
    });
    console.log(`   ✅  Super Admin: ${user.firstName} ${user.lastName} <${user.email}>`);
    console.log(`   🔑  PASSWORD: ${superAdminPassword}`);
    console.log(`   ⚠️  Please save this password NOW. It will not be printed again.`);
    console.log('\n▶  Seeding Tenant Admin account…');
    const taPassword = generateSecurePassword();
    const taPasswordHash = await bcrypt.hash(taPassword, 12);
    const taUser = await prisma.user.upsert({
        where: { email: 'clinic@gmail.com' },
        create: {
            firstName: 'Clinic',
            lastName: 'Admin',
            email: 'clinic@gmail.com',
            passwordHash: taPasswordHash,
            role: client_1.UserRole.TENANT_ADMIN,
            tenantId: tenant.id,
            isActive: true,
        },
        update: { tenantId: tenant.id, role: client_1.UserRole.TENANT_ADMIN },
    });
    console.log(`   ✅  Tenant Admin: ${taUser.firstName} ${taUser.lastName} <${taUser.email}>`);
    console.log(`   🔑  PASSWORD: ${taPassword}`);
    console.log('\n▶  Seeding Doctor account…');
    const docPassword = generateSecurePassword();
    const docPasswordHash = await bcrypt.hash(docPassword, 12);
    const docUser = await prisma.user.upsert({
        where: { email: 'doctor@gmail.com' },
        create: {
            firstName: 'Doctor',
            lastName: 'Ahmad',
            email: 'doctor@gmail.com',
            passwordHash: docPasswordHash,
            role: client_1.UserRole.DOCTOR,
            tenantId: tenant.id,
            isActive: true,
        },
        update: { tenantId: tenant.id, role: client_1.UserRole.DOCTOR },
    });
    console.log(`   ✅  Doctor: ${docUser.firstName} ${docUser.lastName} <${docUser.email}>`);
    console.log(`   🔑  PASSWORD: ${docPassword}`);
    console.log('\n✨  Seeding complete!');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=seed.js.map