import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeactivateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  ip: string;
}
