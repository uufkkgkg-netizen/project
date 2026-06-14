import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllClinics(): Promise<{
        id: string;
        subdomain: string | null;
        name: string;
        contactEmail: string | null;
        isActive: boolean;
        subscriptionStatus: string;
        subscriptionPlan: string;
        trialEndsAt: Date | null;
        subscriptionEndsAt: Date | null;
        createdAt: Date;
        _count: {
            users: number;
            patients: number;
            appointments: number;
        };
    }[]>;
    updateSubscription(tenantId: string, dto: UpdateSubscriptionDto, adminEmail: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        subscriptionStatus: string;
        subscriptionPlan: string;
    }>;
    getSubscriptionHistory(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        previousStatus: string;
        newStatus: string;
        previousPlan: string;
        newPlan: string;
        changedBy: string;
        reason: string | null;
    }[]>;
}
