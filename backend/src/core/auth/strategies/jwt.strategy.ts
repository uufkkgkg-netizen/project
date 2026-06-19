import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

// Extract JWT from HttpOnly cookie first, then fall back to Authorization header
function cookieOrBearerExtractor(req: Request): string | null {
  // Priority 1: Staff access_token cookie (admin panel)
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  // Priority 2: Patient portal cookie
  if (req?.cookies?.portal_access_token) {
    return req.cookies.portal_access_token;
  }
  // Priority 3: Authorization Bearer header (API clients / Swagger)
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
      secretOrKey: process.env.JWT_SECRET || 'TEMP_SECRET_FOR_RENDER_DEPLOYMENT_PLEASE_CHANGE',
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
