import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';

@Global()  // Global so AuditService can be injected anywhere without re-importing
@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    {
      // Register as a global interceptor — runs on EVERY route automatically
      provide:  APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
