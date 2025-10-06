import { BadRequestException, Injectable } from '@nestjs/common';
import { Bodycam } from '@prisma/client';
import { CreateBodycamDto, UpdateBodycamDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper } from '../../common/helpers';

@Injectable()
export class BodycamService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBodycamDto): Promise<Bodycam> {
    const bodycam = await this.prisma.bodycam.create({ data: dto });
    return this.getBodycamById(bodycam.id);
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.bodycam,
      {
        select: {
          id: true,
          name: true,
        },
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
  }

  async findOne(id: string): Promise<Bodycam> {
    return await this.getBodycamById(id);
  }

  async update(id: string, dto: UpdateBodycamDto): Promise<Bodycam> {
    await this.getBodycamById(id);
    await this.prisma.bodycam.update({
      data: dto,
      where: { id },
    });
    return await this.getBodycamById(id);
  }

  async delete(id: string): Promise<Bodycam> {
    await this.getBodycamById(id);
    await this.prisma.bodycam.update({
      data: { deleted_at: new Date() },
      where: { id },
    });
    return await this.getBodycamById(id, true);
  }

  private async getBodycamById(
    id: string,
    isDeleted: boolean = false,
  ): Promise<any> {
    const bodycam = await this.prisma.bodycam.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        deleted_at: true,
      },
    });
    if (isDeleted) return bodycam;
    if (!bodycam) throw new BadRequestException('Bodycam no encontrada');
    if (bodycam.deleted_at) throw new BadRequestException('Bodycam eliminada');
    return bodycam;
  }
}
