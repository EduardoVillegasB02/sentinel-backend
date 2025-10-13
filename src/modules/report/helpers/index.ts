export * from './date.helper';
import { ReportFields } from '../interfaces';
import { messageDisciplinaryLack } from '../helpers/messages';

export * from '../helpers/messages';

export function message(date: string, subject: string, fields: ReportFields) {
  return messageDisciplinaryLack(fields);
}
