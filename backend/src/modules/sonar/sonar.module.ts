import { Module } from '@nestjs/common';
import { SonarService } from './sonar.service';
import { SonarController } from './sonar.controller';

@Module({
  controllers: [SonarController],
  providers: [SonarService],
})
export class SonarModule {}
