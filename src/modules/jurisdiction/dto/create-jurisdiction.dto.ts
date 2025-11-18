import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJurisdictionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
