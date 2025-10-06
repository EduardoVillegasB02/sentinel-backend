import { PartialType } from '@nestjs/mapped-types';
import { CreateOffenderDto } from './create-offender.dto';

export class UpdateOffenderDto extends PartialType(CreateOffenderDto) {}
