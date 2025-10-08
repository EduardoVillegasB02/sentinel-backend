import { Lack, User } from '@prisma/client';

interface Offender {
  id: number;
  name: string;
  lastname: string;
  job: string;
  shift: string;
  regime: string;
  subgerencia: string;
}

export interface ReportFields {
  address: string;
  bodycam: string;
  date: string;
  time: string;
  lack: Lack;
  holder: string;
  offender: Offender;
  user: User;
}
