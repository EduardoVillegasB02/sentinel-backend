import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterDashboardDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { generalHelper, getTrendsTemplate, trendsHelper } from './helpers';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private jurisdictionService: JurisdictionService,
    private subjectService: SubjectService,
  ) {}

  async getGeneral(filters: FilterDashboardDto) {
    const { date_start, date_end } = this.validateDates(filters);
    const group = await this.prisma.report.groupBy({
      by: ['shift', 'subject_id', 'jurisdiction_id', 'process'],
      where: {
        date: {
          gte: date_start,
          lte: date_end,
        },
      },
      _count: { _all: true },
    });
    const subjects = await this.prisma.subject.findMany({
      select: { id: true, name: true },
      where: { deleted_at: null },
    });
    const jurisdictions = await this.prisma.jurisdiction.findMany({
      select: { id: true, name: true },
      where: { deleted_at: null },
    });
    const sub = subjects.map((s) => ({ ...s, sent: 0, approved: 0 }));
    const jur = jurisdictions.map((s) => ({ ...s, sent: 0, approved: 0 }));
    return generalHelper(group, sub, jur);
  }

  async getTrends(filters: FilterDashboardDto) {
    const { date_start, date_end } = this.validateDates(filters);
    const reports = await this.prisma.report.findMany({
      where: {
        deleted_at: null,
        process: { not: null },
        date: {
          gte: date_start,
          lte: date_end,
        },
      },
      select: {
        date: true,
        process: true,
        subject_id: true,
      },
    });
    const subjects = await this.subjectService.getSubjectsDashboard();
    const trends = getTrendsTemplate(date_start, date_end, subjects);
    return trendsHelper(reports, trends);
  }

  async getPerformance(filters: FilterDashboardDto) {
    const { date_start, date_end } = this.validateDates(filters);

    const groups = await this.prisma.report.groupBy({
      by: ['user_id', 'process'],
      where: {
        deleted_at: null,
        date: { gte: date_start, lte: date_end },
      },
      _count: { _all: true },
    });

    const userIds = [...new Set(groups.map((g) => g.user_id))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, lastname: true, rol: true },
    });

    const userMap: Record<string, any> = {};
    users.forEach((u) => {
      userMap[u.id] = {
        id: u.id,
        name: u.name,
        lastname: u.lastname,
        rol: u.rol,
        total: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    });

    groups.forEach((g) => {
      const entry = userMap[g.user_id];
      if (!entry) return;
      const count = g._count._all;
      entry.total += count;
      if (g.process === null) entry.draft += count;
      else if (g.process === 'PENDING') entry.pending += count;
      else if (g.process === 'APPROVED') entry.approved += count;
      else if (g.process === 'REJECTED') entry.rejected += count;
    });

    const performance = Object.values(userMap).sort(
      (a: any, b: any) => b.total - a.total,
    );

    const general = performance.reduce(
      (acc: any, u: any) => {
        acc.total += u.total;
        acc.draft += u.draft;
        acc.pending += u.pending;
        acc.approved += u.approved;
        acc.rejected += u.rejected;
        return acc;
      },
      { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0 },
    );

    return { general, performance };
  }

  private validateDates(filters: FilterDashboardDto): any {
    const { start, end } = filters;
    if (!start || !end)
      throw new BadRequestException(
        'Es necesario ingresar la fecha de inicio y de fin',
      );
    const date_start = new Date(`${start}T00:00:00.000Z`);
    const date_end = new Date(`${end}T23:59:59.999Z`);
    return { date_start, date_end };
  }
}
