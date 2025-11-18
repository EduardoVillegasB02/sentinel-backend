import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Lack, Model, Rol } from '@prisma/client';
import { CreateLackDto, UpdateLackDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';
import { buildSelectLack } from './helpers';

@Injectable()
export class LackService {
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
    const { search, ...pagination } = dto;
    const where: any =
      req.user.rol !== Rol.ADMINISTRATOR ? { deleted_at: null } : {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const lacks = await paginationHelper(
      this.prisma.lack,
      {
        select: buildSelectLack({ relations: true }),
        where,
        orderBy: { name: 'asc' }
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.LACK, req);
    return lacks;
  }

  async findOne(id: string, req: any): Promise<Lack> {
    const lack = await this.getLackById(id, { req });
    await this.auditService.auditGetOne(Model.LACK, id, req);
    return lack;
  }

  async update(id: string, dto: UpdateLackDto, req: any): Promise<Lack> {
    const lack = await this.getLackById(id, { relations: false });
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
    const lack = await this.getLackById(id, { req });
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

  async getLackById(
    id: string,
    options?: { req?: any | null; relations?: Boolean },
  ): Promise<any> {
    const { req = null, relations = true } = options || {};
    const rol = req ? req.user.rol : null;
    const select = relations ? { relations: true } : { ids: true };
    const lack = await this.prisma.lack.findUnique({
      where: { id },
      select: buildSelectLack(select),
    });
    if (!lack) throw new BadRequestException('Falta no encontrada');
    if (rol !== Rol.ADMINISTRATOR && lack.deleted_at)
      throw new BadRequestException('Falta eliminada');
    return lack;
  }
}
