const month = {
  1: 'ENERO',
  2: 'FEBRERO',
  3: 'MARZO',
  4: 'ABRIL',
  5: 'MAYO',
  6: 'JUNIO',
  7: 'JULIO',
  8: 'AGOSTO',
  9: 'SEPTIEMBRE',
  10: 'OCTUBRE',
  11: 'NOVIEMBRE',
  12: 'DICIEMBRE',
};

export function dateString(date: Date) {
  const dateString = date.toISOString();
  const dateOnly = dateString.split('T')[0];
  const timeOnly = dateString.split('T')[1].split('.')[0];
  const dateArray = dateOnly.split('-');
  const monthNumber = Number(dateArray[1]);
  const monthString = month[monthNumber];
  return {
    date: `${dateArray[2]} de ${monthString} del ${dateArray[0]}`,
    time: timeOnly,
  };
}
