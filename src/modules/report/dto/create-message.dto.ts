import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @Matches(/^[0-9]{8}$/)
  offender_dni: string;

  @IsUUID()
  bodycam_id: string;

  @IsUUID()
  lack_id: string;

  @IsUUID()
  subject_id: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;
}
