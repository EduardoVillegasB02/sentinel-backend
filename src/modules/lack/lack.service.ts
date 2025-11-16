import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Lack, Model, Rol } from '@prisma/client';
import { CreateLackDto, UpdateLackDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class LackService {
  private select = {
    id: true,
    article: true,
    absence: true,
    content: true,
    description: true,
    name: true,
    subject: { select: { id: true, name: true } },
    subject_id: false,
    deleted_at: true,
  };

  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateLackDto, req: any): Promise<Lack> {
    const lack = await this.prisma.lack.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.LACK, lack.id, req);
    return this.getLackById(lack.id);
  }

  async findAll(dto: SearchDto, req: any): Promise<any> {
    const { rol } = req.user;
    const { search, ...pagination } = dto;
    const where: any = rol !== Rol.ADMINISTRATOR ? { deleted_at: null } : {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const lacks = await paginationHelper(
      this.prisma.lack,
      { select: this.select, where, orderBy: { name: 'asc' } },
      pagination,
    );
    await this.auditService.auditGetAll(Model.LACK, req);
    return lacks;
  }

  async findOne(id: string, req: any): Promise<Lack> {
    const { rol } = req.user;
    const lack = await this.getLackById(id, rol);
    await this.auditService.auditGetOne(Model.LACK, id, req);
    return lack;
  }

  async update(id: string, dto: UpdateLackDto, req: any): Promise<Lack> {
    const lack = await this.getLackById(id);
    await this.prisma.lack.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditUpdate(Model.LACK, dto, lack, req);
    return await this.getLackById(id);
  }

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const lack = await this.getLackById(id, rol);
    const inactive = lack.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.lack.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at,
      },
      where: { id },
    });
    await this.auditService.auditDelete(Model.LACK, id, inactive, req);
    return {
      action: inactive ? Action.RESTORE : Action.DELETE,
      id,
    };
  }

  async getLackById(id: string, rol: Rol | null = null): Promise<any> {
    const lack = await this.prisma.lack.findUnique({
      where: { id },
      select: this.select,
    });
    if (!lack)
      throw new BadRequestException('Falta disciplinaria no encontrada');
    if (rol !== Rol.ADMINISTRATOR && lack.deleted_at)
      throw new BadRequestException('Falta disciplinaria eliminada');
    return lack;
  }
}
