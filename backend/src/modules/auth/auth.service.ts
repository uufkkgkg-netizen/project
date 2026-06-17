import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string, ipAddress?: string, deviceInfo?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      isSuperAdmin,
    };

    const access_token = await this.jwtService.signAsync(payload);
    const csrfToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(64).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: ipAddress || null,
        deviceInfo: deviceInfo || null,
        expiresAt,
      },
    });

    return {
      access_token,
      csrfToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshTokenString: string, ipAddress?: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: refreshTokenString },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = session.user;
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
    };

    const access_token = await this.jwtService.signAsync(payload);
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt,
        ipAddress: ipAddress || session.ipAddress,
      },
    });

    return { access_token, csrfToken, refreshToken: newRefreshToken, user: this.sanitizeUser(user) };
  }

  async logout(refreshTokenString?: string) {
    if (refreshTokenString) {
      await this.prisma.session.updateMany({
        where: { refreshToken: refreshTokenString },
        data: { isRevoked: true },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            defaultCurrency: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            settings: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      ...this.sanitizeUser(user),
      tenant: (user as any).tenant,
    };
  }

  async registerTenant(dto: RegisterDto) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.clinicName,
          subdomain: dto.subdomain,
          contactEmail: dto.email,
        },
      });
      
      await tx.tenantSettings.create({
        data: { tenantId: tenant.id }
      });

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          role: UserRole.TENANT_ADMIN,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
        },
      });

      return { message: 'Tenant successfully registered', tenantId: tenant.id };
    });
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      tenantId: user.tenantId,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
    };
  }
}
