import { IsDateString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class FilterAttendanceDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}
