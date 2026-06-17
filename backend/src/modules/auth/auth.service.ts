import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // Bypass tenant RLS to find user globally
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
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

    return {
      access_token,
      user: this.sanitizeUser(user),
    };
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
