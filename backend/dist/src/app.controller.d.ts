import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    constructor(appService: AppService, prisma: PrismaService);
    getRoot(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
    };
    getHealth(): {
        status: string;
        uptime: number;
        environment: string;
        timestamp: string;
    };
    getReady(): Promise<{
        status: string;
        db: string;
        uptime: number;
        timestamp: string;
    }>;
}
