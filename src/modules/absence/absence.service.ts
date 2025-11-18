import { Injectable } from '@nestjs/common';
import { CreateAbsenceDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { instanceToPlain } from 'class-transformer';
import { getCurrentYear, timezoneHelper } from '../../common/helpers';
import { Absence, Process } from '@prisma/client';

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAbsenceDto, req: any): Promise<Absence> {
    const { user_id } = req.user;
    const { header, lack_id, subject_id, ...res } = dto;
    const year = getCurrentYear().toString();
    const codes = await this.prisma.report.findMany({
      select: { code: true },
      where: { code: { endsWith: year } },
      orderBy: { code: 'desc' },
    });
    const lastCode = codes[0]?.code?.split('-')[0] ?? '0';
    const codeNumber = Number(lastCode) + 1;
    const format = codeNumber.toString().padStart(3, '0');
    const code = `${format}-${year}`;
    const report = await this.prisma.report.create({
      data: {
        code,
        header: instanceToPlain(header),
        date: timezoneHelper(),
        process: Process.APPROVED,
        lack_id,
        subject_id,
        user_id,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    const start = `${res.start}T08:00:00.000Z`;
    const end = `${res.end}T08:00:00.000Z`;
    return await this.prisma.absence.create({
      data: {
        start,
        end,
        mode: res.mode,
        report_id: report.id,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
  }
}
