import { Lack, User } from '@prisma/client';

interface Offender {
  gestionate_id: number;
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
