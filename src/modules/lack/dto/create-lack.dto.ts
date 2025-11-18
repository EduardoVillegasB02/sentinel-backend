import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLackDto {
  @IsString()
  @IsOptional()
  article?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  subject_id: string;
}
