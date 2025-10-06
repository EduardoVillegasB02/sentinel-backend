import { Module } from '@nestjs/common';
import { SentinelController } from './sentinel.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [SentinelController],
  providers: [UserService],
})
export class SentinelModule {}
