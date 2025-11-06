import { Shift } from '@prisma/client';
import { timezoneHelper } from './timezone.helper';

export function getShift() {
  const date = timezoneHelper();
  const hour = Number(date.toISOString().split('T')[1].split(':')[0]);
  if (hour >= 6 && hour < 14) return Shift.M;
  else if (hour >= 14 && hour < 22) return Shift.T;
  else return Shift.N;
}
