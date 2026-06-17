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
            id: any;
            firstName: any;
            lastName: any;
            email: any;
            tenantId: any;
            avatarUrl: any;
            role: any;
            isSuperAdmin: boolean;
        };
    }>;
    getMe(userId: string): Promise<{
        tenant: any;
        id: any;
        firstName: any;
        lastName: any;
        email: any;
        tenantId: any;
        avatarUrl: any;
        role: any;
        isSuperAdmin: boolean;
    }>;
    registerTenant(dto: RegisterDto): Promise<{
        message: string;
        tenantId: string;
    }>;
    private sanitizeUser;
}
