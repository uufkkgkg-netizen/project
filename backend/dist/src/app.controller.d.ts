import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
}
