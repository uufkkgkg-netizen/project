import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            tenantId: string | null;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    registerTenant(dto: RegisterDto): Promise<{
        message: string;
        tenantId: string;
    }>;
}
