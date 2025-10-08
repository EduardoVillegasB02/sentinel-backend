import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { BodycamModule } from '../bodycam/bodycam.module';
import { LackModule } from '../lack/lack.module';
import { OffenderModule } from '../offender/offender.module';
import { SubjectModule } from '../subject/subject.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    BodycamModule,
    LackModule,
    OffenderModule,
    SubjectModule,
    UserModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, PrismaService],
})
export class ReportModule {}
