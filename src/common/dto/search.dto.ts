import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { Rol } from '@prisma/client';

export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
