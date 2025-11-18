import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { JobModule } from '../job/job.module';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [JobModule],
  controllers: [LeadController],
  providers: [LeadService, AuditService, PrismaService],
  exports: [LeadService],
})
export class LeadModule {}
