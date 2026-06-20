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
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      console.error('FATAL: JWT_SECRET is missing or shorter than 32 characters. Exiting with code 1.');
      process.exit(1);
    }
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
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
