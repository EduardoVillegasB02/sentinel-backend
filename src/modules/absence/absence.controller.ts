import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto, FilterAbsenceDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guard';
import { SuccessMessage } from '../../common/decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @SuccessMessage('Inasistencias creadas exitosamente')
  @Post()
  create(@Body() dto: CreateAbsenceDto) {
    return this.absenceService.create(dto);
  }

  @Get()
  findAll(@Query() dto: FilterAbsenceDto) {
    return this.absenceService.findAll(dto);
  }
}
