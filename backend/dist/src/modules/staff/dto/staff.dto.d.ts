import { UserRole } from '@prisma/client';
export declare const ASSIGNABLE_ROLES: ("DOCTOR" | "RECEPTIONIST" | "ACCOUNTANT" | "NURSE")[];
export declare class CreateStaffDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: UserRole;
    password: string;
}
export declare class UpdateStaffRoleDto {
    role: UserRole;
}
