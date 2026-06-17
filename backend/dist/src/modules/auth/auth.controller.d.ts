import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            tenantId: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        tenantId: string;
    }>;
}
