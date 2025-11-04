import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, AuditService, PrismaService],
  exports: [SubjectService],
})
export class SubjectModule {}
