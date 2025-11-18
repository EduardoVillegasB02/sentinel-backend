import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserController } from './user.controller';
import { SessionService } from '../session/session.service';

@Module({
  providers: [UserService, AuditService, PrismaService, SessionService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
