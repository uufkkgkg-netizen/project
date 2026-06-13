import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
    // Intentionally bypass RLS here to find the user globally across all tenants
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

    const payload = { 
      sub: user.id, 
      email: user.email, 
      tenantId: user.tenantId,
      role: user.role,
      isSuperAdmin 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    };
  }

  async registerTenant(dto: RegisterDto) {
    // 1. Hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 2. Wrap in regular Prisma Transaction (bypass RLS for global creation)
    return this.prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.clinicName,
          subdomain: dto.subdomain,
          contactEmail: dto.email,
        }
      });

      // Create Admin User for this Tenant
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          role: UserRole.TENANT_ADMIN,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
        }
      });

      return { message: 'Tenant successfully registered', tenantId: tenant.id };
    });
  }
}
