import { Action, Model, Status } from '@prisma/client';

export class CreateAuditDto {
  ip: string;
  description: string;
  register_id?: string;
  action: Action;
  model?: Model;
  status: Status;
  field?: string;
  preview_content?: string;
  new_content?: string;
  user_id?: string;
}
