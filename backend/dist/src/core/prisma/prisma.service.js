"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_context_1 = require("./tenant.context");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const TENANT_SCOPED_MODELS = new Set([
    'patient', 'appointment', 'medicalRecord',
    'prescription', 'invoice', 'payment', 'ultrasoundReport', 'medicalTemplate', 'visit', 'user'
]);
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super();
    }
    async onModuleInit() {
        await this.$connect();
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
        }
        catch (e) {
            console.error('Auto-seed failed:', e);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    get scoped() {
        const store = tenant_context_1.TenantContext.getStore();
        const tenantId = store?.tenantId ?? null;
        const isSuperAdmin = store?.isSuperAdmin ?? false;
        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
                        const isTenantModel = TENANT_SCOPED_MODELS.has(modelKey);
                        if (isSuperAdmin || !isTenantModel || !tenantId) {
                            return query(args);
                        }
                        if (['findMany', 'findFirst', 'count', 'aggregate'].includes(operation)) {
                            const a = args;
                            args = { ...args, where: { ...a.where, tenantId } };
                        }
                        if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
                            const a = args;
                            args = { ...args, where: { ...a.where, tenantId } };
                        }
                        if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
                            const a = args;
                            const { where, ...rest } = a;
                            return this.findFirst({ ...rest, where: { ...where, tenantId } });
                        }
                        return query(args);
                    },
                },
            },
        });
    }
    get rls() {
        const store = tenant_context_1.TenantContext.getStore();
        const tenantId = store?.tenantId || '';
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
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map