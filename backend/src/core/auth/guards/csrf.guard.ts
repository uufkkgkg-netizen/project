import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Allow GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Bypass CSRF for login, register, and refresh as they generate new tokens
    const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
    if (publicPaths.includes(request.path) || publicPaths.includes(request.url.split('?')[0])) {
      return true;
    }

    const csrfCookie = request.cookies?.['csrf_token'];
    const csrfHeader = request.headers['x-csrf-token'] || request.headers['x-xsrf-token'];

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
