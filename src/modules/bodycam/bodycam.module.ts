import { Module } from '@nestjs/common';
import { BodycamService } from './bodycam.service';
import { BodycamController } from './bodycam.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [BodycamController],
  providers: [BodycamService, PrismaService],
  exports: [BodycamService],
})
export class BodycamModule {}
