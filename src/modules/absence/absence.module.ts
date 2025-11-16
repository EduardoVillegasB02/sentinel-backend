import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { AuditService } from '../audit/audit.service';
import { OffenderModule } from '../offender/offender.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [OffenderModule],
  controllers: [AbsenceController],
  providers: [AbsenceService, AuditService, PrismaService],
})
export class AbsenceModule {}
