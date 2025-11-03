import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { timezoneHelper } from '../../common/helpers';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto): Promise<any> {
    return this.prisma.session.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
      },
    });
  }

  findAll() {
    return `This action returns all session`;
  }

  findOne(id: number) {
    return `This action returns a #${id} session`;
  }

  update(id: number) {
    return `This action updates a #${id} session`;
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }
}
