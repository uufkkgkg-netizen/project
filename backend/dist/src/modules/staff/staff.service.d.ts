import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateStaffDto, UpdateStaffRoleDto } from './dto/staff.dto';
export declare class StaffService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertSameTenant;
    findAll(tenantId: string, isSuperAdmin: boolean): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        tenant: {
            id: string;
            name: string;
        } | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        phone: string | null;
        lastLogin: Date | null;
    }[]>;
    create(dto: CreateStaffDto, actorTenantId: string, actorIsSuperAdmin: boolean): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
    }>;
    updateRole(staffId: string, dto: UpdateStaffRoleDto, actorTenantId: string, actorIsSuperAdmin: boolean): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
    }>;
    toggleStatus(staffId: string, actorTenantId: string, actorIsSuperAdmin: boolean): Promise<{
        id: string;
        isActive: boolean;
        firstName: string;
        lastName: string;
    }>;
}
