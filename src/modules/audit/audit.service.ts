import { Injectable } from '@nestjs/common';
import { Action, Model } from '@prisma/client';
import { CreateAuditDto, FilterAuditDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { getIP, paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async auditAuth(dto: CreateAuditDto) {
    return await this.prisma.audit.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
      },
    });
  }

  async auditCreate(
    dto: Omit<CreateAuditDto, 'action' | 'description' | 'ip' | 'model'>,
    model: Model,
    req: any,
  ) {
    return await this.create(
      {
        ...dto,
        action: Action.CREATE,
        description: 'Registro creado',
        model,
      },
      req,
    );
  }

  async auditGetAll(
    dto: Omit<CreateAuditDto, 'action' | 'description' | 'ip' | 'model'>,
    model: Model,
    req: any,
  ) {
    return await this.create(
      {
        ...dto,
        action: Action.GET_ALL,
        description: 'Registros obtenidos',
        model,
      },
      req,
    );
  }

  async auditGetOne(
    dto: Omit<CreateAuditDto, 'action' | 'description' | 'ip' | 'model'>,
    model: Model,
    req: any,
  ) {
    return await this.create(
      {
        ...dto,
        action: Action.GET_ONE,
        description: 'Registro obtenido',
        model,
      },
      req,
    );
  }

  async auditUpdate(
    dto: Omit<CreateAuditDto, 'action' | 'description' | 'ip' | 'model'>,
    model: Model,
    req: any,
  ) {
    return await this.create(
      {
        ...dto,
        action: Action.UPDATE,
        description: 'Registro actualizado',
        model,
      },
      req,
    );
  }

  async auditDelete(
    dto: Omit<CreateAuditDto, 'action' | 'description' | 'ip' | 'model'>,
    model: Model,
    req: any,
  ) {
    return await this.create(
      {
        ...dto,
        action: Action.DELETE,
        description: 'Registro eliminado',
        model,
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
    await this.auditGetAll(
      {
        status: 'SUCCESS',
      },
      Model.AUDIT,
      req,
    );
    return audits;
  }

  private async create(dto: Omit<CreateAuditDto, 'ip'>, req: any) {
    return await this.prisma.audit.create({
      data: {
        ...dto,
        ip: getIP(req),
        user_id: req.user.user_id ?? null,
        created_at: timezoneHelper(),
      },
    });
  }
}
