export function generalHelper(group: any[], subjects: any[], jurisdictions: any[]) {
  const total = group.reduce(
    (sum, g) => sum + g._count._all,
    0,
  );
  const morning = group
    .filter((g) => g.shift === 'M')
    .reduce((sum, g) => sum + g._count._all, 0);
  const afternoon = group
    .filter((g) => g.shift === 'T')
    .reduce((sum, g) => sum + g._count._all, 0);
  const evening = group
    .filter((g) => g.shift === 'N')
    .reduce((sum, g) => sum + g._count._all, 0);
  const details = group.map((g) => {
    const subject = subjects.find((s) => s.id === g.subject_id);
    const jurisdiction = jurisdictions.find((j) => j.id === g.jurisdiction_id);
    return {
      subject_id: g.subject_id,
      subject_name: subject?.name ?? 'Sin nombre',
      jurisdiction_id: g.jurisdiction_id,
      jurisdiction_name: jurisdiction?.name ?? 'Sin jurisdicción',
      shift: g.shift,
      count: g._count._all,
    };
  });
  return {
    total,
    morning,
    afternoon,
    evening,
    details,
  };
}
