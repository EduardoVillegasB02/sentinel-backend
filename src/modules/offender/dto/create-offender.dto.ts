import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOffenderDto {
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

  @IsInt()
  gestionate_id: number;
}
