export function buildSelectLack(options?: {
  ids?: Boolean;
  relations?: Boolean;
}) {
  const select: any = {
    id: true,
    article: true,
    absence: true,
    content: true,
    description: true,
    name: true,
    subject_id: false,
    deleted_at: true,
  };
  if (options?.ids)
    Object.assign(select, {
      subject_id: true,
    });
  if (options?.relations)
    Object.assign(select, {
      subject: { select: { id: true, name: true } },
    });
  return select;
}
