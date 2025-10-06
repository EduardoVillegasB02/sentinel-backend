import { Module } from '@nestjs/common';
import { OffenderService } from './offender.service';
import { OffenderController } from './offender.controller';
import { ExternalModule } from '../../external/external.module';

@Module({
  imports: [ExternalModule],
  controllers: [OffenderController],
  providers: [OffenderService],
})
export class OffenderModule {}
