import { PrismaService } from '../prisma/prisma.service';
export interface AuditLogPayload {
    tenantId?: string | null;
    userId?: string | null;
    userEmail?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    oldValues?: Record<string, unknown> | null;
    newValues?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    statusCode?: number | null;
    path?: string | null;
    method?: string | null;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(payload: AuditLogPayload): void;
    findAll(filters: {
        tenantId?: string;
        action?: string;
        entity?: string;
        userId?: string;
        from?: Date;
        to?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            tenantId: string | null;
            userId: string | null;
            ipAddress: string | null;
            userEmail: string | null;
            action: string;
            entity: string;
            entityId: string | null;
            statusCode: number | null;
            path: string | null;
            method: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__AuditLogClient<{
        id: string;
        createdAt: Date;
        tenantId: string | null;
        userId: string | null;
        ipAddress: string | null;
        userEmail: string | null;
        action: string;
        entity: string;
        entityId: string | null;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
        userAgent: string | null;
        statusCode: number | null;
        path: string | null;
        method: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
