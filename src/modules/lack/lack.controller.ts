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
import { LackService } from './lack.service';
import { CreateLackDto, UpdateLackDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lack')
export class LackController {
  constructor(private readonly lackService: LackService) {}

  @Roles('administrator')
  @Post()
  create(@Body() dto: CreateLackDto) {
    return this.lackService.create(dto);
  }

  @Get()
  findAll(@Query() dto: SearchDto) {
    return this.lackService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lackService.findOne(id);
  }

  @Roles('administrator')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLackDto) {
    return this.lackService.update(id, dto);
  }

  @Roles('administrator')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.lackService.delete(id);
  }
}
