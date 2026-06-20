import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as https from 'https';

@Injectable()
export class PingService {
  private readonly logger = new Logger(PingService.name);
  private readonly pingUrl = 'https://femcare-backend-api.onrender.com/health';

  // Run every 10 minutes
  @Cron('*/10 * * * *')
  handleCron() {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    
    this.logger.log('Pinging self to prevent Render cold sleep...');
    
    https.get(this.pingUrl, (res) => {
      if (res.statusCode === 200) {
        this.logger.log('Ping successful! Server is awake.');
      } else {
        this.logger.warn(`Ping returned status code: ${res.statusCode}`);
      }
    }).on('error', (e) => {
      this.logger.error(`Ping failed: ${e.message}`);
    });
  }
}
