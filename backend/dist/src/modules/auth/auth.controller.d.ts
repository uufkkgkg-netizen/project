import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response, Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
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
    getMe(req: Request & {
        user: any;
    }): Promise<{
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
    logout(res: Response): Promise<{
        message: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        tenantId: string;
    }>;
}
