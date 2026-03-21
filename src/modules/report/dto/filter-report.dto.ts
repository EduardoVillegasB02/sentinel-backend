import { Process, Shift } from '@prisma/client';
import { SearchDto } from '../../../common/dto';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterReportDto extends SearchDto {
  @IsUUID()
  @IsOptional()
  jurisdiction?: string;

  @IsUUID()
  @IsOptional()
  lack?: string;

  @IsEnum(Process)
  @IsOptional()
  process?: Process;

  @IsUUID()
  @IsOptional()
  subject?: string;

  @IsEnum(Shift)
  @IsOptional()
  shift?: Shift;

  @IsString()
  @IsOptional()
  subgerencia?: string;

  @IsOptional()
  start?: string;

  @IsOptional()
  end?: string;
}
