import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLackDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  article: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
