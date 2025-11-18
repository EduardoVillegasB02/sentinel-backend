import { Module } from '@nestjs/common';
import { JurisdictionService } from './jurisdiction.service';
import { JurisdictionController } from './jurisdiction.controller';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [JurisdictionController],
  providers: [JurisdictionService, AuditService, PrismaService],
  exports: [JurisdictionService],
})
export class JurisdictionModule {}
