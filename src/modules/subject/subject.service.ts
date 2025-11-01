import { BadRequestException, Injectable } from '@nestjs/common';
import { Subject } from '@prisma/client';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const subject = await this.prisma.subject.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return this.getSubjectById(subject.id);
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.subject,
      {
        select: {
          id: true,
          name: true,
          lacks: { select: { id: true, name: true } },
        },
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
  }

  async findOne(id: string): Promise<Subject> {
    return await this.getSubjectById(id);
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    await this.getSubjectById(id);
    await this.prisma.subject.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    return await this.getSubjectById(id);
  }

  async delete(id: string): Promise<any> {
    await this.getSubjectById(id);
    await this.prisma.subject.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getSubjectById(id: string): Promise<any> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lacks: { select: { id: true, name: true } },
        deleted_at: true,
      },
    });
    if (!subject) throw new BadRequestException('Asunto no encontrado');
    if (subject.deleted_at) throw new BadRequestException('Asunto eliminado');
    return subject;
  }
}
