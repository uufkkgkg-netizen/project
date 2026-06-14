import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    WhatsappModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}
