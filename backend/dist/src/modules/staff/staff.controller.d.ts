import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffRoleDto } from './dto/staff.dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    findAll(req: any): Promise<{
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
    create(dto: CreateStaffDto, req: any): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
    }>;
    updateRole(id: string, dto: UpdateStaffRoleDto, req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
    }>;
    toggleStatus(id: string, req: any): Promise<{
        id: string;
        isActive: boolean;
        firstName: string;
        lastName: string;
    }>;
}
