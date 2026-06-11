import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all tenants with their current subscription status */
  async getAllClinics() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        contactEmail: true,
        isActive: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        createdAt: true,
        _count: {
          select: {
            patients: true,
            appointments: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Update a clinic's subscription status & plan — logs the change */
  async updateSubscription(
    tenantId: string,
    dto: UpdateSubscriptionDto,
    adminEmail: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      },
    });
    if (!tenant) throw new NotFoundException(`Clinic with ID ${tenantId} not found`);

    // Update tenant in a transaction that also writes an audit log entry
    const [updated] = await this.prisma.$transaction([
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: dto.status,
          subscriptionPlan: dto.plan,
          isActive: dto.status !== 'suspended' && dto.status !== 'canceled',
        },
        select: {
          id: true, name: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          isActive: true,
        },
      }),
      this.prisma.clinicSubscription.create({
        data: {
          tenantId,
          previousStatus: tenant.subscriptionStatus,
          newStatus: dto.status,
          previousPlan: tenant.subscriptionPlan,
          newPlan: dto.plan,
          changedBy: adminEmail,
          reason: dto.reason,
        },
      }),
    ]);

    return updated;
  }

  /** Fetch full audit log for a specific clinic */
  async getSubscriptionHistory(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException(`Clinic not found`);

    return this.prisma.clinicSubscription.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
