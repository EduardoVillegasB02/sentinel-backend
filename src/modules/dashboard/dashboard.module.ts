import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { SubjectModule } from '../subject/subject.module';
import { JurisdictionModule } from '../jurisdiction/jurisdiction.module';

@Module({
  imports: [AuditModule, JurisdictionModule, SubjectModule],
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
