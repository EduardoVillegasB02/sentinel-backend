import { Cam } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'
import { SearchDto } from '../../../common/dto'

export class FilterBodycamDto extends SearchDto {
  @IsOptional()
  @IsEnum(Cam)
  cam?: Cam;
}
