export * from './date.helper';
import { ReportFields } from '../interfaces';
import { header } from '../helpers/header.template';
import { messageDisciplinaryLack } from '../helpers/messages';

export * from '../helpers/header.template';
export * from '../helpers/messages';

export function message(date: string, subject: string, fields: ReportFields) {
  return {
    header: header(date, subject),
    message: messageDisciplinaryLack(fields),
  };
}
