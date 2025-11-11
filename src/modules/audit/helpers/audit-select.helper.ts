export function buildAuditSelect() {
  return {
    id: true,
    ip: true,
    action: true,
    model: true,
    status: true,
    description: true,
    register_id: true,
    field: true,
    preview_content: true,
    new_content: true,
    user: {
      select: { id: true, username: true },
    },
  };
}
