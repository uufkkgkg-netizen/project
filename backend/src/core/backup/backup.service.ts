import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  async onModuleInit() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory at ${this.backupDir}`);
    }
  }

  // Runs every day at 3:00 AM
  @Cron('0 3 * * *')
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
      // pg_dump using the connection string
      await execAsync(`pg_dump "${dbUrl}" -F c -f "${filepath}"`);
      this.logger.log('Backup created successfully.');

      // Cleanup old backups (keep last 7 days)
      await this.cleanupOldBackups();
    } catch (error) {
      this.logger.error('Database backup failed', error);
    }
  }

  private async cleanupOldBackups() {
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
    } catch (error) {
      this.logger.error('Failed to cleanup old backups', error);
    }
  }
}
