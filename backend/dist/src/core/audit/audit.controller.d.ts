import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(req: any, action?: string, entity?: string, tenantId?: string, from?: string, to?: string, page?: string, limit?: string): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    } | null>;
}
