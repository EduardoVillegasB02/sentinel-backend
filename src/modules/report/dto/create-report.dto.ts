import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
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
  @IsObject({ message: 'El campo to debe ser un objeto válido.' })
  @ValidateNested()
  @Type(() => RecipientDto)
  to: RecipientDto;

  @IsArray({ message: 'El campo cc debe ser un arreglo válido.' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un destinatario en "cc".' })
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  cc: RecipientDto[];
}

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => HeaderDto)
  header: HeaderDto;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @Matches(/^[0-9]{8}$/)
  bodycam_dni: string;

  @IsString()
  bodycam_supervisor: string;

  @Matches(/^[0-9]{8}$/)
  offender_dni: string;

  @IsUUID()
  @IsNotEmpty()
  bodycam_id: string;

  @IsOptional()
  @IsUUID()
  lack_id?: string;

  @IsUUID()
  @IsNotEmpty()
  subject_id: string;
}
