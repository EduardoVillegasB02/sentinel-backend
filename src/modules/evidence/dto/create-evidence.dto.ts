import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
