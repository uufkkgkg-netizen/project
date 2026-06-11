import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogPayload {
  tenantId?:  string | null;
  userId?:    string | null;
  userEmail?: string | null;
  action:     string;   // CREATE | UPDATE | DELETE | LOGIN | SUSPEND | ACCESS
  entity:     string;   // PATIENT | INVOICE | STAFF | APPOINTMENT | AUTH | SYSTEM
  entityId?:  string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode?: number | null;
  path?:      string | null;
  method?:    string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes an audit log entry.
   * ALWAYS non-blocking — uses fire-and-forget so it never delays the API response.
   */
  log(payload: AuditLogPayload): void {
    // Fire-and-forget: errors are swallowed to never impact API performance
    setImmediate(() => {
      this.prisma.auditLog
        .create({ data: payload as any })
        .catch((err) =>
          this.logger.warn(`Audit log write failed (non-critical): ${err.message}`),
        );
    });
  }

  /**
   * Paginated query for the Super Admin audit dashboard.
   */
  async findAll(filters: {
    tenantId?:  string;
    action?:    string;
    entity?:    string;
    userId?:    string;
    from?:      Date;
    to?:        Date;
    page?:      number;
    limit?:     number;
  }) {
    const { page = 1, limit = 50, tenantId, action, entity, userId, from, to } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (action)   where.action   = action;
    if (entity)   where.entity   = entity;
    if (userId)   where.userId   = userId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to)   where.createdAt.lte = to;
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, tenantId: true, userId: true, userEmail: true,
          action: true, entity: true, entityId: true,
          ipAddress: true, statusCode: true, path: true, method: true,
          createdAt: true,
          // Omit oldValues/newValues from list view for performance
        },
      }),
    ]);

    return { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Returns a single log entry with full JSON diff */
  findOne(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }
}
