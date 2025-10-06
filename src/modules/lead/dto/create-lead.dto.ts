import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(25)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(25)
  lastname: string;

  @IsUUID()
  job_id: string;
}
