import { Module } from '@nestjs/common';
import { BodycamService } from './bodycam.service';
import { BodycamController } from './bodycam.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BodycamController],
  providers: [BodycamService, PrismaService],
})
export class BodycamModule {}
