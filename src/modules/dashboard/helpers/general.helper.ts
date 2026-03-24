import { Process, Shift } from '@prisma/client';

export function generalHelper(
  group: any[],
  subjects: any[],
  jurisdictions: any[],
) {
  const total = group.reduce((sum, g) => sum + g._count._all, 0);
  const morning = group
    .filter((g) => g.shift === Shift.M)
    .reduce((sum, g) => sum + g._count._all, 0);
  const afternoon = group
    .filter((g) => g.shift === Shift.T)
    .reduce((sum, g) => sum + g._count._all, 0);
  const evening = group
    .filter((g) => g.shift === Shift.N)
    .reduce((sum, g) => sum + g._count._all, 0);
  group.map((g) => {
    const subject = subjects.find((s) => s.id === g.subject_id);
    if (subject) {
      subject.sent += g._count._all;
      if (g.process === Process.APPROVED) subject.approved += g._count._all;
    }
    const jurisdiction = jurisdictions.find((j) => j.id === g.jurisdiction_id);
    if (jurisdiction) {
      jurisdiction.sent += g._count._all;
      if (g.process === Process.APPROVED) jurisdiction.approved += g._count._all;
    }
  });
  const top_subject = subjects.length > 0
    ? subjects.reduce((max, s) => s.sent > max.sent ? s : max)
    : null;
  const top_jurisdiction = jurisdictions.length > 0
    ? jurisdictions.reduce((max, s) => s.sent > max.sent ? s : max)
    : null;
  return {
    total,
    morning,
    afternoon,
    evening,
    top_subject,
    top_jurisdiction,
  };
}
