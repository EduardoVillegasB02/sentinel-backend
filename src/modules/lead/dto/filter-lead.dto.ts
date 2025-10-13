import { IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from '../../../common/dto';

export class FilterLeadDto extends SearchDto {
  @IsOptional()
  @IsUUID()
  job?: string;
}
