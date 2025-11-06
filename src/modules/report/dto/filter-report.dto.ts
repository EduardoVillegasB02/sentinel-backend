import { Shift } from '@prisma/client';
import { SearchDto } from '../../../common/dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterReportDto extends SearchDto {
  @IsUUID()
  @IsOptional()
  jurisdiction?: string;

  @IsUUID()
  @IsOptional()
  lack?: string;

  @IsUUID()
  @IsOptional()
  subject?: string;

  @IsEnum(Shift)
  @IsOptional()
  shift?: Shift;
}
