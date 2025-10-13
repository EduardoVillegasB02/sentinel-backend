import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateOffenderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @Matches(/^[0-9]{8}$/)
  dni: string;

  @IsInt()
  gestionate_id: number;

  @IsBoolean()
  verified?: boolean = false;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsString()
  @IsNotEmpty()
  shift: string;

  @IsString()
  @IsNotEmpty()
  regime: string;

  @IsString()
  @IsNotEmpty()
  subgerencia: string;
}
