export function header(date: string, subject: string) {
  return {
    to: {
      name: 'Sr. DAVID',
      job: 'Sub Gerente de Serenazgo',
    },
    cc: {
      name: 'Sr. JOSE',
      job: 'Jefe de Operaciones',
    },
    from: 'CONTROL Y SUPERVISIÓN',
    subject,
    date: `San Juan de Lurigancho, ${date}`,
  };
}
