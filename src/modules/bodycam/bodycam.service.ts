import { BadRequestException, Injectable } from '@nestjs/common';
import { Bodycam, Model } from '@prisma/client';
import * as xlsx from 'xlsx';
import { CreateBodycamDto, UpdateBodycamDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class BodycamService {
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
    await this.auditService.auditCreate(
      {
        status: 'SUCCESS',
        register_id: bodycam.id,
      },
      Model.BODYCAM,
      req,
    );
    return this.getBodycamById(bodycam.id);
  }

  async findAll(dto: SearchDto, req: any): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const bodycams = await paginationHelper(
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
    await this.auditService.auditGetAll(
      {
        status: 'SUCCESS',
      },
      Model.BODYCAM,
      req,
    );
    return bodycams;
  }

  async findOne(id: string, req: any): Promise<Bodycam> {
    const bodycam = await this.getBodycamById(id);
    await this.auditService.auditGetOne(
      {
        status: 'SUCCESS',
        register_id: id,
      },
      Model.BODYCAM,
      req,
    );
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
    for (const key in dto)
      await this.auditService.auditGetOne(
        {
          status: 'SUCCESS',
          register_id: id,
          field: key,
          preview_content: bodycam[key],
          new_content: dto[key],
        },
        Model.BODYCAM,
        req,
      );
    return await this.getBodycamById(id);
  }

  async delete(id: string, req: any): Promise<any> {
    await this.getBodycamById(id);
    await this.auditService.auditDelete(
      {
        status: 'SUCCESS',
        register_id: id,
      },
      Model.BODYCAM,
      req,
    );
    await this.prisma.bodycam.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  async bulkUpload(file: Express.Multer.File, req: any) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const bodycams = rows.map((row: any) => {
      return {
        name: row.name,
        serie: row.serie,
      };
    });
    await this.prisma.bodycam.createMany({
      data: bodycams,
    });
    return {
      message: 'Creación masiva exitosa',
    };
  }

  async getBodycamById(id: string): Promise<any> {
    const bodycam = await this.prisma.bodycam.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        serie: true,
        deleted_at: true,
      },
    });
    if (!bodycam) throw new BadRequestException('Bodycam no encontrada');
    if (bodycam.deleted_at) throw new BadRequestException('Bodycam eliminada');
    return bodycam;
  }
}
