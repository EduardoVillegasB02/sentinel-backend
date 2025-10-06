import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  latitude: number;

  @IsString()
  @IsNotEmpty()
  longitude: number;

  @IsUUID()
  bodycam_id: number;
}
