import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Job, Model, Rol } from '@prisma/client';
import { CreateJobDto, UpdateJobDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class JobService {
  private select: any = { id: true, name: true, deleted_at: true };

  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateJobDto, req: any): Promise<Job> {
    const job = await this.prisma.job.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.JOB, job.id, req);
    return this.getJobById(job.id);
  }

  async findAll(dto: SearchDto, req: any): Promise<any> {
    const { rol } = req.user;
    const { search, ...pagination } = dto;
    const where: any = rol !== Rol.ADMINISTRATOR ? { deleted_at: null } : {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const jobs = await paginationHelper(
      this.prisma.job,
      {
        select: this.select,
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.JOB, req);
    return jobs;
  }

  async findOne(id: string, req: any): Promise<Job> {
    const { rol } = req.user;
    const job = await this.getJobById(id, rol);
    await this.auditService.auditGetOne(Model.JOB, id, req);
    return job;
  }

  async update(id: string, dto: UpdateJobDto, req: any): Promise<Job> {
    const job = await this.getJobById(id);
    await this.prisma.job.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditUpdate(Model.JOB, dto, job, req);
    return await this.getJobById(id);
  }

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const job = await this.getJobById(id, rol);
    const inactive = job.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.job.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at,
      },
      where: { id },
    });
    await this.auditService.auditDelete(Model.JOB, id, inactive, req);
    return {
      action: inactive ? Action.RESTORE : Action.DELETE,
      id,
    };
  }

  async getJobById(id: string, rol: Rol | null = null): Promise<any> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: this.select,
    });
    if (!job) throw new BadRequestException('Cargo no encontrado');
    if (rol !== Rol.ADMINISTRATOR && job.deleted_at)
      throw new BadRequestException('Cargo eliminado');
    return job;
  }
}
