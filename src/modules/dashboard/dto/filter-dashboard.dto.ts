import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class FilterDashboardDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  subject?: string;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}
