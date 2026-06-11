import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Bypass TenantContext for auth routes
    if (url.includes('/api/auth/login') || url.includes('/api/auth/register') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return next.handle();
    }

    const isSuperAdmin = request.user?.isSuperAdmin;
    const requestedTenantId = request.headers['x-tenant-id'];
    
    // Impersonation: If Super Admin provides x-tenant-id, use it. Otherwise, use their own tenantId.
    const tenantId = (isSuperAdmin && requestedTenantId) 
      ? requestedTenantId 
      : request.user?.tenantId;

    const userId = request.user?.userId;

    return new Observable((subscriber) => {
      TenantContext.run({ tenantId, isSuperAdmin, userId }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
