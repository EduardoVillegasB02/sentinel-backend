import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [UserService, AuditService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
