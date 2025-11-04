import { Module } from '@nestjs/common';
import { BodycamService } from './bodycam.service';
import { BodycamController } from './bodycam.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [BodycamController],
  providers: [BodycamService, AuditService, PrismaService],
  exports: [BodycamService],
})
export class BodycamModule {}
