import { OnModuleInit } from '@nestjs/common';
export declare class BackupService implements OnModuleInit {
    private readonly logger;
    private readonly backupDir;
    onModuleInit(): Promise<void>;
    handleDailyBackup(): Promise<void>;
    performBackup(): Promise<void>;
    private cleanupOldBackups;
}
