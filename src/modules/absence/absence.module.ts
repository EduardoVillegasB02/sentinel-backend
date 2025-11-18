import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AbsenceController],
  providers: [AbsenceService, PrismaService],
})
export class AbsenceModule {}
