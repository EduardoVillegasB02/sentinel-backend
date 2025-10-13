import { BadRequestException, Injectable } from '@nestjs/common';
import { Lead } from '@prisma/client';
import { CreateLeadDto, UpdateLeadDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return this.getLeadById(lead.id);
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.lead,
      {
        select: {
          id: true,
          name: true,
          lastname: true,
          job: true,
          position: true,
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

  async delete(id: string): Promise<Lead> {
    await this.getLeadById(id);
    await this.prisma.lead.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
    return this.getLeadById(id, true);
  }

  private async getLeadById(
    id: string,
    isDeleted: boolean = false,
  ): Promise<any> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        job: true,
        position: true,
        deleted_at: true,
      },
    });
    if (isDeleted) return lead;
    if (!lead) throw new BadRequestException('Jefe no encontrado');
    if (lead.deleted_at) throw new BadRequestException('Jefe eliminado');
    return lead;
  }
}
