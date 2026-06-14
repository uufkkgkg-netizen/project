import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): {
        status: string;
        message: string;
        version: string;
    };
    getStatus(): Promise<{
        status: string;
        usersCount: any;
        version: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        version: string;
        usersCount?: undefined;
    }>;
}
