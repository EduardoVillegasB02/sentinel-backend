export function buildLeadSelect(options?: {
  ids?: Boolean;
  relations?: Boolean;
}) {
  const base: any = {
    id: true,
    name: true,
    lastname: true,
    deleted_at: true,
  };
  if (options?.ids)
    Object.assign(base, {
      job_id: true,
    });
  if (options?.relations)
    Object.assign(base, {
      job: {
        select: { id: true, name: true },
      },
    });
  return base;
}
