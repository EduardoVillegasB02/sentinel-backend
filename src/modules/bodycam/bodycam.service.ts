import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Bodycam, Model, Rol } from '@prisma/client';
import * as xlsx from 'xlsx';
import { CreateBodycamDto, FilterBodycamDto, UpdateBodycamDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class BodycamService {
  private select = {
    id: true,
    name: true,
    serie: true,
    cam: true,
    deleted_at: true,
  };

  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateBodycamDto, req: any): Promise<Bodycam> {
    const bodycam = await this.prisma.bodycam.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.BODYCAM, bodycam.id, req);
    return this.getBodycamById(bodycam.id);
  }

  async findAll(dto: FilterBodycamDto, req: any): Promise<any> {
    const { rol } = req.user;
    const { search, cam, ...pagination } = dto;
    const where: any = rol !== Rol.ADMINISTRATOR ? { deleted_at: null } : {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (cam) where.cam = cam;
    const bodycams = await paginationHelper(
      this.prisma.bodycam,
      {
        select: this.select,
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.BODYCAM, req);
    return bodycams;
  }

  async findOne(id: string, req: any): Promise<Bodycam> {
    const { rol } = req.user;
    const bodycam = await this.getBodycamById(id, rol);
    await this.auditService.auditGetOne(Model.BODYCAM, id, req);
    return bodycam;
  }

  async update(id: string, dto: UpdateBodycamDto, req: any): Promise<Bodycam> {
    const bodycam = await this.getBodycamById(id);
    await this.prisma.bodycam.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditUpdate(Model.BODYCAM, dto, bodycam, req);
    return await this.getBodycamById(id);
  }

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const bodycam = await this.getBodycamById(id, rol);
    const inactive = bodycam.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.bodycam.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at,
      },
      where: { id },
    });
    await this.auditService.auditDelete(Model.BODYCAM, id, inactive, req);
    return {
      action: inactive ? Action.RESTORE : Action.DELETE,
      id,
    };
  }

  async bulkUpload(dto: any, file: Express.Multer.File, req: any) {
    const cam = dto.cam;
    const bodycams = await this.prisma.bodycam.findMany({
      where: { cam },
    });
    if (bodycams.length !== 0)
      throw new BadRequestException('Solo se puedo realizar una vez');
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const data = rows.map((row: any) => {
      return {
        name: String(row.name),
        serie: row?.serie ?? null,
        cam,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      };
    });
    await this.prisma.bodycam.createMany({ data });
    return {
      message: 'Creación masiva exitosa',
    };
  }

  async getBodycamById(id: string, rol: Rol | null = null): Promise<any> {
    const bodycam = await this.prisma.bodycam.findUnique({
      where: { id },
      select: this.select,
    });
    if (!bodycam) throw new BadRequestException('Bodycam no encontrada');
    if (rol !== Rol.ADMINISTRATOR && bodycam.deleted_at)
      throw new BadRequestException('Bodycam eliminada');
    return bodycam;
  }
}
