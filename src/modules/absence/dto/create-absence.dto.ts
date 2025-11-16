import { Mode } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AbsenceItemDto {
  @IsDateString()
  date: string;

  @IsEnum(Mode)
  @IsOptional()
  mode?: Mode;
}

export class OffenderAbsenceDto {
  @IsUUID()
  @IsNotEmpty()
  offender_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbsenceItemDto)
  absences: AbsenceItemDto[];
}

export class CreateAbsenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OffenderAbsenceDto)
  items: OffenderAbsenceDto[];
}
