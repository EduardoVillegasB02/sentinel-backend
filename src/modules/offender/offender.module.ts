import { Module } from '@nestjs/common';
import { OffenderService } from './offender.service';
import { OffenderController } from './offender.controller';
import { ExternalModule } from '../../external/external.module';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [ExternalModule],
  controllers: [OffenderController],
  providers: [OffenderService, AuditService, PrismaService],
  exports: [OffenderService],
})
export class OffenderModule {}
