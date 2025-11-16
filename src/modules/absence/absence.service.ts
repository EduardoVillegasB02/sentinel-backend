import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAbsenceDto, FilterAbsenceDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OffenderService } from '../offender/offender.service';
import { timezoneHelper } from 'src/common/helpers';

@Injectable()
export class AbsenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly offenderService: OffenderService,
  ) {}

  async create(dto: CreateAbsenceDto) {
    const absences: any = [];
    for (const item of dto.items) {
      const offender_id = item.offender_id;
      await this.offenderService.findOne(offender_id);
      for (const a of item.absences) {
        const date = `${a.date}T08:00:00.000Z`;
        const validate = await this.findOne(date, offender_id);
        if (validate) {
          if (a.mode)
            await this.prisma.absence.update({
              data: {
                mode: a.mode,
                updated_at: timezoneHelper(),
                deleted_at: null,
              },
              where: { id: validate },
            });
          else
            await this.prisma.absence.update({
              data: {
                updated_at: timezoneHelper(),
                deleted_at: timezoneHelper(),
              },
              where: { id: validate },
            });
          continue;
        }
        absences.push({
          offender_id,
          date,
          mode: a.mode,
          created_at: timezoneHelper(),
          updated_at: timezoneHelper(),
        });
      }
    }
    if (absences.length > 0)
      await this.prisma.absence.createMany({
        data: absences,
        skipDuplicates: false,
      });
    return {
      count: absences.length,
    };
  }

  async findAll(dto: FilterAbsenceDto) {
    const { date_start, date_end } = this.validateDates(dto);
    const offenders = await this.prisma.offender.findMany({
      where: { absence: true, deleted_at: null },
      include: {
        absences: {
          where: {
            date: { gte: date_start, lte: date_end },
          },
          orderBy: { date: 'asc' },
        },
      },
    });
    const data: any = [];
    for (const offender of offenders) {
      const { id, name, lastname, dni, absences } = offender;
      const dates: any = [];
      absences.map((a) => {
        dates.push({
          id: a.id,
          date: a.date?.toISOString().split('T')[0],
          mode: a.mode,
          delete_at: a.deleted_at,
        });
      });
      data.push({ id, name, lastname, dni, dates });
    }
    return data;
  }

  async findOne(date: string, offender_id: string) {
    const absence = await this.prisma.absence.findFirst({
      where: { date, offender_id },
    });
    if (!absence) return null;
    return absence.id;
  }

  private validateDates(dto: FilterAbsenceDto): any {
    const { start, end } = dto;
    if (!start || !end)
      throw new BadRequestException(
        'Es necesario ingresar la fecha de inicio y de fin',
      );
    const date_start = new Date(`${start}T00:00:00.000Z`);
    const date_end = new Date(`${end}T23:59:59.999Z`);
    return { date_start, date_end };
  }
}
