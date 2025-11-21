import { Shift } from '@prisma/client';

export function getShift(date: Date) {
  const hour = Number(new Date(date).toISOString().split('T')[1].split(':')[0]);
  if (hour >= 6 && hour < 14) return Shift.M;
  else if (hour >= 14 && hour < 22) return Shift.T;
  else return Shift.N;
}
