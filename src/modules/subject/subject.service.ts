import { BadRequestException, Injectable } from '@nestjs/common';
import { Subject } from '@prisma/client';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper } from '../../common/helpers';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const subject = await this.prisma.subject.create({ data: dto });
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
          description: true,
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
      data: dto,
      where: { id },
    });
    return await this.getSubjectById(id);
  }

  async delete(id: string): Promise<Subject> {
    await this.getSubjectById(id);
    await this.prisma.subject.update({
      data: { deleted_at: new Date() },
      where: { id },
    });
    return await this.getSubjectById(id, true);
  }

  private async getSubjectById(
    id: string,
    isDeleted: boolean = false,
  ): Promise<any> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        deleted_at: true,
      },
    });
    if (isDeleted) return subject;
    if (!subject) throw new BadRequestException('Asunto no encontrado');
    if (subject.deleted_at) throw new BadRequestException('Asunto eliminado');
    return subject;
  }
}
