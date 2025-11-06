import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilterDashboardDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { generalHelper } from './helpers';

@Injectable()
export class DashboardService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async getStatistics(filters: FilterDashboardDto): Promise<any> {
    const general = await this.getGeneral(filters);
    return { general };
  }

  async getGeneral2(filters: FilterDashboardDto): Promise<any> {
    const grouped = await this.prisma.report.groupBy({
      by: ['subject_id'],
      _count: { _all: true },
    });

    const subjectIds: any = grouped.map((g) => g.subject_id);

    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true },
    });

    const result = grouped.map((g) => ({
      subject_id: g.subject_id,
      count: g._count._all,
      name: subjects.find((s) => s.id === g.subject_id)?.name || null,
    }));

    return result;
  }

  async getGeneral(filters: FilterDashboardDto) {
    const group = await this.prisma.report.groupBy({
      by: ['shift', 'subject_id', 'jurisdiction_id'],
      _count: { _all: true },
    });
    console.log(group);
    const subjects = await this.prisma.subject.findMany({
      select: { id: true, name: true },
      where: { deleted_at: null },
    });
    const jurisdictions = await this.prisma.jurisdiction.findMany({
      select: { id: true, name: true },
      where: { deleted_at: null },
    });
    return generalHelper(group, subjects, jurisdictions);
  }

  async getTrends(filters: FilterDashboardDto) {
    const { start, end } = filters;
    if (!start || !end)
      throw new BadRequestException('Es necesario ingresar la fecha de inicio y de fin');
  }
}
