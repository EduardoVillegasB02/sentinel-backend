import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBodycamDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
