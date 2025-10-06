import { BadRequestException, Injectable } from '@nestjs/common';
import { Offender } from '@prisma/client';
import { CreateOffenderDto, UpdateOffenderDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { paginationHelper } from '../../common/helpers';
import { ExternalService } from 'src/external/external.service';

@Injectable()
export class OffenderService {
  constructor(
    private external: ExternalService,
    private prisma: PrismaService
  ) {}

  async create(dto: CreateOffenderDto): Promise<any> {
    //const offender = await this.prisma.offender.create({ data: dto });
    //return this.getOffenderById(offender.id);
    return this.external.getExternalUser('75326417');
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.offender,
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

  async findOne(id: string): Promise<Offender> {
    return await this.getOffenderById(id);
  }

  async update(id: string, dto: UpdateOffenderDto): Promise<Offender> {
    await this.getOffenderById(id);
    await this.prisma.offender.update({
      data: dto,
      where: { id },
    });
    return await this.getOffenderById(id);
  }

  async delete(id: string): Promise<Offender> {
    await this.getOffenderById(id);
    await this.prisma.offender.update({
      data: { deleted_at: new Date() },
      where: { id },
    });
    return await this.getOffenderById(id, true);
  }

  private async getOffenderById(
    id: string,
    isDeleted: boolean = false,
  ): Promise<any> {
    const offender = await this.prisma.offender.findUnique({
      where: { id },
      select: {
        name: true,
        deleted_at: true,
      },
    });
    if (isDeleted) return offender;
    if (!offender) throw new BadRequestException('Infractor no encontrada');
    if (offender.deleted_at)
      throw new BadRequestException('Infractor eliminada');
    return offender;
  }
}
