import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantContext } from '../../prisma/tenant.context';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Run the Passport authentication inside the TenantContext store
    return new Promise<boolean>((resolve, reject) => {
      const activate = super.canActivate(context);
      const result = activate instanceof Observable
        ? activate.toPromise()
        : Promise.resolve(activate);

      result.then((valid) => {
        if (!valid) return resolve(false);
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user) return resolve(false);
        // Set the tenant context for downstream services (Prisma RLS)
        TenantContext.run(
          { tenantId: user.tenantId, isSuperAdmin: user.isSuperAdmin },
          () => resolve(true),
        );
      }).catch(reject);
    });
  }

  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
