export function buildReportSelect(options?: {
  ids?: Boolean;
  relations?: Boolean;
}) {
  const base: any = {
    id: true,
    address: true,
    date: true,
    bodycam_user: true,
    header: true,
    latitude: true,
    longitude: true,
    message: true,
    shift: true,
    evidences: {
      where: { deleted_at: null },
    },
    deleted_at: true,
  };
  if (options?.ids)
    Object.assign(base, {
      bodycam_id: true,
      jurisdiction_id: true,
      lack_id: true,
      offender_id: true,
      subject_id: true,
      user_id: true,
    });
  if (options?.relations)
    Object.assign(base, {
      bodycam: {
        select: { id: true, name: true },
      },
      jurisdiction: {
        select: { id: true, name: true },
      },
      lack: {
        select: { id: true, name: true },
      },
      offender: {
        select: {
          id: true,
          name: true,
          lastname: true,
          dni: true,
          job: true,
          regime: true,
          shift: true,
          subgerencia: true,
        },
      },
      subject: {
        select: { id: true, name: true },
      },
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          lastname: true,
          email: true,
          dni: true,
          phone: true,
        },
      },
    });
  return base;
}
