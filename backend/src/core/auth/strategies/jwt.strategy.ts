import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

// Extract JWT from HttpOnly cookie first, then fall back to Authorization header
function cookieOrBearerExtractor(req: Request): string | null {
  // Priority 1: HttpOnly cookie set by backend (most secure)
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  // Priority 2: Authorization Bearer header (for cross-origin / API clients)
  const authHeader = req?.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_USE_ENV_VAR',
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      isSuperAdmin: payload.isSuperAdmin ?? false,
    };
  }
}
