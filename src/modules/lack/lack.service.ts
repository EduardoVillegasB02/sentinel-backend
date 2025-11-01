import { BadRequestException, Injectable } from '@nestjs/common';
import { Lack } from '@prisma/client';
import { CreateLackDto, UpdateLackDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class LackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLackDto): Promise<Lack> {
    const lack = await this.prisma.lack.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return this.getLackById(lack.id);
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.lack,
      {
        select: {
          id: true,
          article: true,
          content: true,
          description: true,
          name: true,
          subject: { select: { id: true, name: true } },
        },
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
  }

  async findOne(id: string): Promise<Lack> {
    return await this.getLackById(id);
  }

  async update(id: string, dto: UpdateLackDto): Promise<Lack> {
    await this.getLackById(id);
    await this.prisma.lack.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    return await this.getLackById(id);
  }

  async delete(id: string): Promise<any> {
    await this.getLackById(id);
    await this.prisma.lead.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getLackById(id: string): Promise<any> {
    const lack = await this.prisma.lack.findUnique({
      where: { id },
      select: {
        id: true,
        article: true,
        content: true,
        description: true,
        name: true,
        subject: { select: { id: true, name: true } },
        deleted_at: true,
      },
    });
    if (!lack)
      throw new BadRequestException('Falta disciplinaria no encontrada');
    if (lack.deleted_at)
      throw new BadRequestException('Falta disciplinaria eliminada');
    return lack;
  }
}
