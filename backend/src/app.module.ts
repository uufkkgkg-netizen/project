import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CsrfGuard } from './core/auth/guards/csrf.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { BillingModule } from './modules/billing/billing.module';
import { SonarModule } from './modules/sonar/sonar.module';
import { AdminModule } from './modules/admin/admin.module';
import { StaffModule } from './modules/staff/staff.module';
import { AuditModule } from './core/audit/audit.module';
import { MedicalTemplatesModule } from './modules/medical-templates/medical-templates.module';
import { TenantInterceptor } from './core/prisma/tenant.interceptor';
import { UltrasoundReportsModule } from './modules/ultrasound-reports/ultrasound-reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { PingService } from './core/ping/ping.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ── Rate Limiting: 100 requests / 60 seconds globally ──────────────────
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,   // 60 seconds
        limit: 100,   // max 100 requests
      },
      {
        name: 'auth',
        ttl: 60000,   // 60 seconds
        limit: 10,    // max 10 login attempts per minute
      },
    ]),
    PrismaModule,
    AuditModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    AnalyticsModule,
    PrescriptionsModule,
    BillingModule,
    SonarModule,
    AdminModule,
    StaffModule,
    MedicalTemplatesModule,
    UltrasoundReportsModule,
    SettingsModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ── Apply rate limiting globally ──────────────────────────────────────
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    PingService,
  ],
})
export class AppModule {}
