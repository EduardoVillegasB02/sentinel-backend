import { Action, Model, Status } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from '../../../common/dto';

export class FilterAuditDto extends SearchDto {
  @IsEnum(Action)
  @IsOptional()
  action?: Action;

  @IsEnum(Model)
  @IsOptional()
  model?: Model;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsUUID()
  @IsOptional()
  user?: string;
}
