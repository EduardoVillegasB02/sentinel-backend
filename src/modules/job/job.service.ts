import { BadRequestException, Injectable } from '@nestjs/common';
import { Job } from '@prisma/client';
import { CreateJobDto, UpdateJobDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = await this.prisma.job.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return this.getJobById(job.id);
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.job,
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
  }

  async findOne(id: string): Promise<Job> {
    return await this.getJobById(id);
  }

  async update(id: string, dto: UpdateJobDto): Promise<Job> {
    await this.getJobById(id);
    await this.prisma.job.update({
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    return await this.getJobById(id);
  }

  async delete(id: string): Promise<any> {
    await this.getJobById(id);
    await this.prisma.job.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getJobById(id: string): Promise<any> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        deleted_at: true,
      },
    });
    if (!job) throw new BadRequestException('Cargo no encontrado');
    if (job.deleted_at) throw new BadRequestException('Cargo eliminado');
    return job;
  }
}
