import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [JobController],
  providers: [JobService, AuditService, PrismaService],
  exports: [JobService],
})
export class JobModule {}
