import { PartialType } from '@nestjs/mapped-types';
import { CreateBodycamDto } from './create-bodycam.dto';

export class UpdateBodycamDto extends PartialType(CreateBodycamDto) {}
