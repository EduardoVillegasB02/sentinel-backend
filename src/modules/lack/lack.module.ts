import { Module } from '@nestjs/common';
import { LackService } from './lack.service';
import { LackController } from './lack.controller';

@Module({
  controllers: [LackController],
  providers: [LackService],
})
export class LackModule {}
