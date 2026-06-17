import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';
import type { Response } from 'express';
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
        memory: NodeJS.MemoryUsage;
        timestamp: string;
        environment: string;
    };
    getReady(res: Response): Promise<Response<any, Record<string, any>>>;
}
