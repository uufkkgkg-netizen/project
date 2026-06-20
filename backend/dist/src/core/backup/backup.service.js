"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    logger = new common_1.Logger(BackupService_1.name);
    backupDir = path.join(process.cwd(), 'backups');
    async onModuleInit() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            this.logger.log(`Created backup directory at ${this.backupDir}`);
        }
    }
    async handleDailyBackup() {
        this.logger.log('Starting daily automated database backup...');
        await this.performBackup();
    }
    async performBackup() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            this.logger.error('DATABASE_URL is not defined. Cannot perform backup.');
            return;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(this.backupDir, filename);
        try {
            this.logger.log(`Executing pg_dump to ${filepath}`);
            await execAsync(`pg_dump "${dbUrl}" -F c -f "${filepath}"`);
            this.logger.log('Backup created successfully.');
            await this.cleanupOldBackups();
        }
        catch (error) {
            this.logger.error('Database backup failed', error);
        }
    }
    async cleanupOldBackups() {
        try {
            const files = await fs.promises.readdir(this.backupDir);
            const now = Date.now();
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
            for (const file of files) {
                const filePath = path.join(this.backupDir, file);
                const stats = await fs.promises.stat(filePath);
                if (now - stats.mtimeMs > SEVEN_DAYS_MS) {
                    await fs.promises.unlink(filePath);
                    this.logger.log(`Deleted old backup file: ${file}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup old backups', error);
        }
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "handleDailyBackup", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)()
], BackupService);
//# sourceMappingURL=backup.service.js.map