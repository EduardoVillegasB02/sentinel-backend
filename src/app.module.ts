import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BodycamModule } from './modules/bodycam/bodycam.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { JobModule } from './modules/job/job.module';
import { LackModule } from './modules/lack/lack.module';
import { LeadModule } from './modules/lead/lead.module';
import { OffenderModule } from './modules/offender/offender.module';
import { ReportModule } from './modules/report/report.module';
import { SentinelModule } from './modules/sentinel/sentinel.module';
import { SubjectModule } from './modules/subject/subject.module';
import { SupervisorModule } from './modules/supervisor/supervisor.module';
import { UserModule } from './modules/user/user.module';
import { ExternalModule } from './external/external.module';
import { AuditModule } from './modules/audit/audit.module';
import { SessionModule } from './modules/session/session.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    BodycamModule,
    EvidenceModule,
    JobModule,
    LackModule,
    LeadModule,
    OffenderModule,
    ReportModule,
    SentinelModule,
    SubjectModule,
    SupervisorModule,
    UserModule,
    ExternalModule,
    AuditModule,
    SessionModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
