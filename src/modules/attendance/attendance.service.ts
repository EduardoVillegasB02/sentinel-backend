import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceDto, FilterAttendanceDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OffenderService } from '../offender/offender.service';
import { timezoneHelper } from 'src/common/helpers';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly offenderService: OffenderService,
  ) {}

  async create(dto: CreateAttendanceDto) {
    const attendances: any = [];
    for (const item of dto.items) {
      const offender_id = item.offender_id;
      await this.offenderService.findOne(offender_id);
      for (const a of item.attendances) {
        const date = `${a.date}T08:00:00.000Z`;
        const validate = await this.findOne(date, offender_id);
        if (validate) {
          if (a.mode)
            await this.prisma.attendance.update({
              data: {
                mode: a.mode,
                updated_at: timezoneHelper(),
                deleted_at: null,
              },
              where: { id: validate },
            });
          else
            await this.prisma.attendance.update({
              data: {
                updated_at: timezoneHelper(),
                deleted_at: timezoneHelper(),
              },
              where: { id: validate },
            });
          continue;
        }
        attendances.push({
          offender_id,
          date,
          mode: a.mode,
          created_at: timezoneHelper(),
          updated_at: timezoneHelper(),
        });
      }
    }
    if (attendances.length > 0)
      await this.prisma.attendance.createMany({
        data: attendances,
        skipDuplicates: false,
      });
    return {
      count: attendances.length,
    };
  }

  async findAll(dto: FilterAttendanceDto) {
    const { date_start, date_end } = this.validateDates(dto);
    const offenders = await this.prisma.offender.findMany({
      where: { attendance: true, deleted_at: null },
      include: {
        attendances: {
          where: {
            date: { gte: date_start, lte: date_end },
          },
          orderBy: { date: 'asc' },
        },
      },
    });
    const data: any = [];
    for (const offender of offenders) {
      const { id, name, lastname, dni, attendances } = offender;
      const dates: any = [];
      attendances.map((a) => {
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
    const attendance = await this.prisma.attendance.findFirst({
      where: { date, offender_id },
    });
    if (!attendance) return null;
    return attendance.id;
  }

  private validateDates(dto: FilterAttendanceDto): any {
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
