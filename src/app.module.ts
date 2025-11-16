import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { BodycamModule } from './modules/bodycam/bodycam.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { JobModule } from './modules/job/job.module';
import { JurisdictionModule } from './modules/jurisdiction/jurisdiction.module';
import { LackModule } from './modules/lack/lack.module';
import { LeadModule } from './modules/lead/lead.module';
import { OffenderModule } from './modules/offender/offender.module';
import { ReportModule } from './modules/report/report.module';
import { SessionModule } from './modules/session/session.module';
import { SubjectModule } from './modules/subject/subject.module';
import { UserModule } from './modules/user/user.module';
import { ExternalModule } from './external/external.module';
import { CacheModule } from './cache/cache.module';
import { AllExceptionsFilter } from './common/filters';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AbsenceModule } from './modules/absence/absence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    BodycamModule,
    EvidenceModule,
    JobModule,
    LackModule,
    LeadModule,
    OffenderModule,
    ReportModule,
    SessionModule,
    SubjectModule,
    UserModule,
    ExternalModule,
    CacheModule,
    JurisdictionModule,
    DashboardModule,
    AbsenceModule,
  ],
  controllers: [AppController],
  providers: [AppService, AllExceptionsFilter],
})
export class AppModule {}
