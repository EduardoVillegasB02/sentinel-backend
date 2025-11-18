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

export class AttendanceItemDto {
  @IsDateString()
  date: string;

  @IsEnum(Mode)
  @IsOptional()
  mode?: Mode;
}

export class OffenderAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  offender_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  attendances: AttendanceItemDto[];
}

export class CreateAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OffenderAttendanceDto)
  items: OffenderAttendanceDto[];
}
