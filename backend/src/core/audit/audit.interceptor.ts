import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

// Map URL path segments → entity names
const PATH_TO_ENTITY: Record<string, string> = {
  patients:     'PATIENT',
  appointments: 'APPOINTMENT',
  prescriptions:'PRESCRIPTION',
  billing:      'INVOICE',
  sonar:        'ULTRASOUND',
  staff:        'STAFF',
  users:        'USER',
  auth:         'AUTH',
  admin:        'ADMIN',
  analytics:    'ANALYTICS',
};

// Map HTTP methods → action names
const METHOD_TO_ACTION: Record<string, string> = {
  POST:   'CREATE',
  PATCH:  'UPDATE',
  PUT:    'UPDATE',
  DELETE: 'DELETE',
  GET:    'ACCESS',
};

function extractEntity(path: string): string {
  const segment = path.replace(/^\/api\//, '').split('/')[0];
  return PATH_TO_ENTITY[segment] ?? segment.toUpperCase();
}

function extractEntityId(path: string): string | null {
  // e.g. /api/patients/abc-uuid → abc-uuid
  const parts = path.replace(/^\/api\//, '').split('/');
  return parts.length >= 2 ? parts[1] : null;
}

function getClientIp(req: any): string | null {
  return (
    req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers?.['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.ip ||
    null
  );
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    // Skip GET requests for read-only audit (optional — set to false to log all)
    const SKIP_GET = process.env.AUDIT_LOG_READS !== 'true';
    if (SKIP_GET && req.method === 'GET') return next.handle();

    // Skip internal/health paths
    const path: string = req.path || req.url || '';
    if (path.includes('/health') || path.includes('/metrics')) return next.handle();

    const user = req.user;
    const action   = METHOD_TO_ACTION[req.method] ?? req.method;
    const entity   = extractEntity(path);
    const entityId = extractEntityId(path);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers?.['user-agent'] ?? null;

    return next.handle().pipe(
      tap({
        next: () => {
          // Response succeeded — log asynchronously, non-blocking
          this.auditService.log({
            tenantId:   user?.tenantId   ?? null,
            userId:     user?.userId     ?? null,
            userEmail:  user?.email      ?? null,
            action,
            entity,
            entityId,
            ipAddress,
            userAgent,
            statusCode: context.switchToHttp().getResponse().statusCode,
            path,
            method:     req.method,
          });
        },
        error: (err) => {
          // Also log failures (useful for detecting attack patterns)
          this.auditService.log({
            tenantId:   user?.tenantId   ?? null,
            userId:     user?.userId     ?? null,
            userEmail:  user?.email      ?? null,
            action,
            entity,
            entityId,
            ipAddress,
            userAgent,
            statusCode: err?.status ?? 500,
            path,
            method:     req.method,
          });
        },
      }),
    );
  }
}
