import { Mode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class RecipientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  job: string;
}

class HeaderDto {
  @IsObject({ message: 'El campo to debe ser un objeto válido' })
  @ValidateNested()
  @Type(() => RecipientDto)
  to: RecipientDto;

  @IsArray({ message: 'El campo cc debe ser un arreglo válido' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un destinatario en cc' })
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  cc: RecipientDto[];
}

export class CreateAbsenceDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsEnum(Mode)
  mode: Mode;

  @IsObject()
  @ValidateNested()
  @Type(() => HeaderDto)
  header: HeaderDto;

  @IsUUID()
  @IsNotEmpty()
  lack_id: string;

  @IsUUID()
  @IsNotEmpty()
  subject_id: string;
}
