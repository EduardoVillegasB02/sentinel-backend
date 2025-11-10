import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Model, Rol, Subject } from '@prisma/client';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class SubjectService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateSubjectDto, req: any): Promise<Subject> {
    const subject = await this.prisma.subject.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.SUBJECT, subject.id, req);
    return this.getSubjectById(subject.id);
  }

  async findAll(dto: SearchDto, req: any): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const subjects = await paginationHelper(
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
    await this.auditService.auditGetAll(Model.SUBJECT, req);
    return subjects;
  }

  async findOne(id: string, req: any): Promise<Subject> {
    const { rol } = req.user;
    const subject = await this.getSubjectById(id, rol);
    await this.auditService.auditGetOne(Model.SUBJECT, id, req);
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto, req: any): Promise<Subject> {
    const subject = await this.getSubjectById(id);
    await this.prisma.subject.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditUpdate(Model.SUBJECT, dto, subject, req);
    return await this.getSubjectById(id);
  }

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const subject = await this.getSubjectById(id, rol);
    const inactive = subject.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.subject.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at,
      },
      where: { id },
    });
    await this.auditService.auditDelete(Model.SUBJECT, id, inactive, req);
    return {
      action: inactive ? Action.RESTORE : Action.DELETE,
      id,
    };
  }

  async getSubjectById(id: string, rol: Rol | null = null): Promise<any> {
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
    if (rol !== Rol.ADMINISTRATOR && subject.deleted_at)
      throw new BadRequestException('Asunto eliminado');
    return subject;
  }

  async getSubjectsDashboard(): Promise<any[]> {
    const subjects = await this.prisma.subject.findMany({
      where: { deleted_at: null },
      select: { id: true },
      orderBy: { name: 'asc' },
    });
    return subjects.map((s) => s.id);
  }
}
