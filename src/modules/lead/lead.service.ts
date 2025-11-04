import { BadRequestException, Injectable } from '@nestjs/common';
import { Lead } from '@prisma/client';
import { CreateLeadDto, FilterLeadDto, UpdateLeadDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';
import { JobService } from '../job/job.service';

@Injectable()
export class LeadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobService: JobService,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    await this.jobService.getJobById(dto.job_id);
    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return this.getLeadById(lead.id);
  }

  async findAll(dto: FilterLeadDto): Promise<any> {
    const { job, search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
      ];
    if (job) where.job_id = job;
    return await paginationHelper(
      this.prisma.lead,
      {
        select: {
          id: true,
          name: true,
          lastname: true,
          job: {
            select: { id: true, name: true },
          },
        },
        where,
        orderBy: { name: 'asc' },
      },
      pagination,
    );
  }

  async findOne(id: string): Promise<Lead> {
    return await this.getLeadById(id);
  }

  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    if (dto.job_id) await this.jobService.getJobById(dto.job_id);
    await this.getLeadById(id);
    await this.prisma.lead.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    return await this.getLeadById(id);
  }

  async delete(id: string): Promise<any> {
    await this.getLeadById(id);
    await this.prisma.lead.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getLeadById(id: string): Promise<any> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        job: {
          select: { id: true, name: true },
        },
        deleted_at: true,
      },
    });
    if (!lead) throw new BadRequestException('Jefe no encontrado');
    if (lead.deleted_at) throw new BadRequestException('Jefe eliminado');
    return lead;
  }
}
