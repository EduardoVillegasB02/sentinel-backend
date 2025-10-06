import { PartialType } from '@nestjs/mapped-types';
import { CreateLackDto } from './create-lack.dto';

export class UpdateLackDto extends PartialType(CreateLackDto) {}
