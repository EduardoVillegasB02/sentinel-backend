import { Module } from '@nestjs/common';
import { LackService } from './lack.service';
import { LackController } from './lack.controller';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LackController],
  providers: [LackService, AuditService, PrismaService],
  exports: [LackService],
})
export class LackModule {}
