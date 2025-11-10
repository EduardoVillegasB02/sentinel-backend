import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Lead, Model, Rol } from '@prisma/client';
import { CreateLeadDto, FilterLeadDto, UpdateLeadDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JobService } from '../job/job.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';
import { buildLeadSelect } from './helpers';

@Injectable()
export class LeadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly jobService: JobService,
  ) {}

  async create(dto: CreateLeadDto, req: any): Promise<Lead> {
    await this.jobService.getJobById(dto.job_id);
    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.LEAD, lead.id, req);
    return this.getLeadById(lead.id);
  }

  async findAll(dto: FilterLeadDto, req: any): Promise<any> {
    const { rol } = req.user;
    const { job, search, ...pagination } = dto;
    const where: any = rol !== Rol.ADMINISTRATOR ? { deleted_at: null } : {};
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
      ];
    if (job) where.job_id = job;
    const leads = await paginationHelper(
      this.prisma.lead,
      {
        select: buildLeadSelect({ relations: true }),
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.LEAD, req);
    return leads;
  }

  async findOne(id: string, req: any): Promise<Lead> {
    const { rol } = req.user;
    const lead = await this.getLeadById(id, { rol });
    await this.auditService.auditGetOne(Model.LEAD, id, req);
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, req: any): Promise<Lead> {
    const { rol } = req.user;
    if (dto.job_id) await this.jobService.getJobById(dto.job_id);
    const lead = await this.getLeadById(id, { rol, relation: false });
    await this.prisma.lead.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditUpdate(Model.LEAD, dto, lead, req);
    return await this.getLeadById(id);
  }

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const lead = await this.getLeadById(id, { rol });
    const inactive = lead.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.lead.update({
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

  private async getLeadById(
    id: string,
    options?: {
      rol?: Rol | null;
      relation?: Boolean;
    },
  ): Promise<any> {
    const { rol = null, relation = true } = options || {};
    const select = relation ? { relations: true } : { ids: true };
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      select: buildLeadSelect(select),
    });
    if (!lead) throw new BadRequestException('Jefe no encontrado');
    if (rol && rol !== Rol.ADMINISTRATOR && lead.deleted_at)
      throw new BadRequestException('Jefe eliminado');
    return lead;
  }
}
