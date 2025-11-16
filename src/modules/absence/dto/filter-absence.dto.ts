import { IsDateString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class FilterAbsenceDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}
