import { BadRequestException, Injectable } from '@nestjs/common';
import { Offender } from '@prisma/client';
import { UpdateOffenderDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDto } from '../../common/dto';
import { ExternalService } from '../../external/external.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';

@Injectable()
export class OffenderService {
  constructor(
    private external: ExternalService,
    private prisma: PrismaService,
  ) {}

  async create(dni: string, verified?: boolean): Promise<any> {
    const offender = await this.getOffenderByDni(dni, verified);
    if (offender) return offender;
    const dto = await this.verifyPersonal(dni);
    const newOffender = await this.prisma.offender.create({
      data: {
        ...dto,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return newOffender;
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
      data: {
        ...dto,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    return await this.getOffenderById(id);
  }

  async delete(id: string): Promise<Offender> {
    await this.getOffenderById(id);
    await this.prisma.offender.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
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

  private async getOffenderByDni(
    dni: string,
    verified: boolean = false,
  ): Promise<any> {
    const offender = await this.prisma.offender.findUnique({
      where: { dni },
    });
    if (!offender) return null;
    if (!verified)
      throw new BadRequestException(
        'El personal seleccionado ya cuenta con un informe',
      );
    return offender.id;
  }

  private async verifyPersonal(dni: string) {
    const personal = await this.external.getExternalUser(dni);
    if (!personal)
      throw new BadRequestException(
        'El personal con ese DNI no se encuentra en el Gestionate',
      );
    return {
      gestionate_id: personal.id,
      name: personal.nombres,
      lastname: personal.apellidos,
      dni,
      job: personal.cargo.nombre,
      regime: personal.regimenLaboral.nombre,
      shift: personal.turno.nombre,
      subgerencia: personal.subgerencia.nombre,
    };
  }
}
