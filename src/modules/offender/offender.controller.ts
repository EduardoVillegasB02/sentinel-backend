import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OffenderService } from './offender.service';
import { CreateOffenderDto, UpdateOffenderDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offender')
export class OffenderController {
  constructor(private readonly offenderService: OffenderService) {}

  @Get()
  findAll(@Query() dto: SearchDto) {
    return this.offenderService.findAll(dto);
  }

  @Get('dni/:dni')
  findDni(@Param('dni') dni: string) {
    return this.offenderService.findDni(dni);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offenderService.findOne(id);
  }

  @Roles('administrator')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOffenderDto,
  ) {
    return this.offenderService.update(id, dto);
  }

  @Roles('administrator')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.offenderService.delete(id);
  }
}
