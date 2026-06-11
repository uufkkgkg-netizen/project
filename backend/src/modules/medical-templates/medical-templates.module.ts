import { Module } from '@nestjs/common';
import { MedicalTemplatesController } from './medical-templates.controller';
import { MedicalTemplatesService } from './medical-templates.service';

@Module({
  controllers: [MedicalTemplatesController],
  providers:   [MedicalTemplatesService],
  exports:     [MedicalTemplatesService],
})
export class MedicalTemplatesModule {}
