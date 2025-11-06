import { Injectable } from '@nestjs/common';
import { Action, Audit, Model, Status } from '@prisma/client';
import { CreateAuditDto, FilterAuditDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { getIP, paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async auditAuth(dto: CreateAuditDto): Promise<Audit> {
    return await this.prisma.audit.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
      },
    });
  }

  async auditCreate(
    model: Model,
    register_id: string,
    req: any,
  ): Promise<Audit> {
    return await this.create(
      {
        action: Action.CREATE,
        description: 'Registro creado',
        model,
        register_id,
      },
      req,
    );
  }

  async auditGetAll(model: Model, req: any): Promise<Audit> {
    return await this.create(
      {
        action: Action.GET_ALL,
        description: 'Registros obtenidos',
        model,
      },
      req,
    );
  }

  async auditGetOne(
    model: Model,
    register_id: string,
    req: any,
  ): Promise<Audit> {
    return await this.create(
      {
        action: Action.GET_ONE,
        description: 'Registro obtenido',
        model,
        register_id,
      },
      req,
    );
  }

  async auditUpdate(
    model: Model,
    dto: any,
    register: any,
    req: any,
  ): Promise<void> {
    for (const key in dto)
      await this.create(
        {
          action: Action.UPDATE,
          description: 'Registro actualizado',
          model,
          register_id: register.id,
          field: key,
          preview_content: register[key],
          new_content: key === 'password' ? dto[key] : null,
        },
        req,
      );
  }

  async auditDelete(
    model: Model,
    register_id: string,
    inactive: Date | null,
    req: any,
  ): Promise<Audit> {
    return await this.create(
      {
        action: inactive ? Action.RESTORE : Action.DELETE,
        description: inactive ? 'Registro restaurado' : 'Registro eliminado',
        model,
        register_id,
      },
      req,
    );
  }

  async findAll(dto: FilterAuditDto, req: any) {
    const { search, action, model, status, user, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search)
      where.user = { username: { contains: search, mode: 'insensitive' } };
    if (action) where.action = action;
    if (model) where.model = model;
    if (status) where.status = status;
    if (user) where.user_id = user;
    const audits = await paginationHelper(
      this.prisma.audit,
      {
        select: {
          id: true,
          ip: true,
          action: true,
          model: true,
          status: true,
          description: true,
          register_id: true,
          field: true,
          preview_content: true,
          new_content: true,
          user: {
            select: { id: true, username: true },
          },
        },
        where,
        orderBy: { created_at: 'desc' },
      },
      pagination,
    );
    await this.auditGetAll(Model.AUDIT, req);
    return audits;
  }

  private async create(
    dto: Omit<CreateAuditDto, 'ip' | 'status'>,
    req: any,
  ): Promise<Audit> {
    return await this.prisma.audit.create({
      data: {
        ...dto,
        ip: getIP(req),
        status: Status.SUCCESS,
        user_id: req.user.user_id ?? null,
        created_at: timezoneHelper(),
      },
    });
  }
}
