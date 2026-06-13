import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateStaffDto, UpdateStaffRoleDto, ASSIGNABLE_ROLES } from './dto/staff.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  // ── helpers ──────────────────────────────────────────────────
  private assertSameTenant(actorTenantId: string | null, targetTenantId: string | null, isSuperAdmin: boolean) {
    if (isSuperAdmin) return; // Super admins can operate across tenants
    if (!actorTenantId || actorTenantId !== targetTenantId) {
      throw new ForbiddenException('لا يمكنك إدارة موظفين خارج نطاق عيادتك');
    }
  }

  // ── findAll ───────────────────────────────────────────────────
  async findAll(tenantId: string, isSuperAdmin: boolean) {
    const where = isSuperAdmin ? {} : { tenantId };
    return this.prisma.user.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, isActive: true,
        createdAt: true, lastLogin: true,
        tenant: { select: { id: true, name: true } },
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── create ────────────────────────────────────────────────────
  async create(dto: CreateStaffDto, actorTenantId: string, actorIsSuperAdmin: boolean) {
    // Security: non-super-admins can only create staff within their tenant
    // and cannot assign SUPER_ADMIN role (enforced at DTO level + here)
    if (!actorIsSuperAdmin && !ASSIGNABLE_ROLES.includes(dto.role as any)) {
      throw new ForbiddenException('لا يمكنك تعيين هذا الدور');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existingUser) throw new BadRequestException('البريد الإلكتروني مستخدم مسبقاً');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        firstName:    dto.firstName,
        lastName:     dto.lastName,
        email:        dto.email,
        phone:        dto.phone,
        passwordHash,
        tenantId:     actorIsSuperAdmin ? null : actorTenantId,
        role:         dto.role,
      },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, isActive: true,
        role: true,
      },
    });
  }

  // ── updateRole ────────────────────────────────────────────────
  async updateRole(
    staffId: string,
    dto: UpdateStaffRoleDto,
    actorTenantId: string,
    actorIsSuperAdmin: boolean,
  ) {
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
      select: { id: true, tenantId: true, role: true },
    });
    if (!staff) throw new NotFoundException('الموظف غير موجود');

    // Prevent non-admins from touching staff outside their tenant
    this.assertSameTenant(actorTenantId, staff.tenantId, actorIsSuperAdmin);

    // Prevent escalation to SUPER_ADMIN by non-super-admins
    if (!actorIsSuperAdmin && !ASSIGNABLE_ROLES.includes(dto.role as any)) {
      throw new ForbiddenException('لا يمكنك تعيين هذا الدور');
    }

    return this.prisma.user.update({
      where: { id: staffId },
      data: { role: dto.role },
      select: { id: true, firstName: true, lastName: true, role: true },
    });
  }

  // ── toggleStatus ──────────────────────────────────────────────
  async toggleStatus(staffId: string, actorTenantId: string, actorIsSuperAdmin: boolean) {
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
      select: { id: true, tenantId: true, isActive: true, role: true },
    });
    if (!staff) throw new NotFoundException('الموظف غير موجود');

    this.assertSameTenant(actorTenantId, staff.tenantId, actorIsSuperAdmin);

    // Prevent suspending another SUPER_ADMIN by a non-super-admin
    if (!actorIsSuperAdmin && staff.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('لا يمكنك تعليق حساب مدير عام');
    }

    return this.prisma.user.update({
      where: { id: staffId },
      data:  { isActive: !staff.isActive },
      select: { id: true, firstName: true, lastName: true, isActive: true },
    });
  }
}
