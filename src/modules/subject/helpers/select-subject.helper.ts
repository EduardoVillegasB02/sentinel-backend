export function buildSelectSubject(relations: Boolean = true) {
  const select: any = {
    id: true,
    name: true,
    deleted_at: true,
  };
  if (relations)
    Object.assign(select, {
      lacks: {
        select: { id: true, name: true },
      },
    });
  return select;
}
