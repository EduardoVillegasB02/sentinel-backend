import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AuditService } from '../audit/audit.service';
import { OffenderModule } from '../offender/offender.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [OffenderModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AuditService, PrismaService],
})
export class AttendanceModule {}
