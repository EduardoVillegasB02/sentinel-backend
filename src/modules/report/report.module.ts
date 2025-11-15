import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportGateway } from './report.gateway';
import { ReportController } from './report.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { BodycamModule } from '../bodycam/bodycam.module';
import { EvidenceModule } from '../evidence/evidence.module';
import { LackModule } from '../lack/lack.module';
import { LeadModule } from '../lead/lead.module';
import { OffenderModule } from '../offender/offender.module';
import { SubjectModule } from '../subject/subject.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AuditModule,
    BodycamModule,
    EvidenceModule,
    LackModule,
    LeadModule,
    OffenderModule,
    SubjectModule,
    UserModule,
  ],
  controllers: [ReportController],
  providers: [ReportGateway, ReportService, PrismaService],
})
export class ReportModule {}
