import { Module } from '@nestjs/common';
import { UltrasoundReportsService } from './ultrasound-reports.service';
import { UltrasoundReportsController } from './ultrasound-reports.controller';

@Module({
  controllers: [UltrasoundReportsController],
  providers: [UltrasoundReportsService],
})
export class UltrasoundReportsModule {}
