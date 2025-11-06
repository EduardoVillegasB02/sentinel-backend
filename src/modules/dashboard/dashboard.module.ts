import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AuditService, PrismaService],
})
export class DashboardModule {}
