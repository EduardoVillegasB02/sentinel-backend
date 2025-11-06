import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, AuditService, PrismaService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
