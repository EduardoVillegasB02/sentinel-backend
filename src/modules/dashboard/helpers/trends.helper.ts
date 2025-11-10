import { Process } from '@prisma/client';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { Trend } from '../types';

export function getTrendsTemplate(start: Date, end: Date, fields: any[]) {
  const daysCount = differenceInCalendarDays(end, start);
  const fieldsZero = toZeroCounts(fields);
  const trends: Trend = { sent: 0, approved: 0, days: [] };
  for (let i = 0; i < daysCount; i++)
    trends.days.push({
      date: addDays(start, i).toISOString().split('T')[0],
      sent: 0,
      approved: 0,
      subjects: fieldsZero,
    });
  return trends;
}

export function trendsHelper(reports: any[], trends: Trend): Trend {
  for (const report of reports) {
    const procces = report.process === Process.APPROVED;
    const date = report.date.toISOString().split('T')[0];
    const day = trends.days.find((d) => d.date === date);
    if (!day) continue;
    const id = report.subject_id;
    const key = Object.hasOwn(day.subjects, id) ? id : 'others';
    const prev = day.subjects[key];
    day.sent++;
    trends.sent++;
    day.approved += procces ? 1 : 0;
    trends.approved += procces ? 1 : 0;
    day.subjects = {
      ...day.subjects,
      [key]: {
        sent: (prev?.sent ?? 0) + 1,
        approved: (prev?.approved ?? 0) + (procces ? 1 : 0),
      },
    };
  }
  return trends;
}

function toZeroCounts(fields: string[]): any {
  const list: any = Object.fromEntries(
    [...new Set(fields.filter(Boolean))].map((k) => [
      k,
      { sent: 0, approved: 0 },
    ]),
  );
  list['others'] = { sent: 0, approved: 0 };
  return list;
}
