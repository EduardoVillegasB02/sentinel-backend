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
  Req,
} from '@nestjs/common';
import { LackService } from './lack.service';
import { CreateLackDto, UpdateLackDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lack')
export class LackController {
  constructor(private readonly lackService: LackService) {}

  @Roles('ADMINISTRATOR')
  @Post()
  create(@Body() dto: CreateLackDto, @Req() req: Request) {
    return this.lackService.create(dto, req);
  }

  @Get()
  findAll(@Query() dto: SearchDto, @Req() req: Request) {
    return this.lackService.findAll(dto, req);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.lackService.findOne(id, req);
  }

  @Roles('ADMINISTRATOR')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLackDto,
    @Req() req: Request,
  ) {
    return this.lackService.update(id, dto, req);
  }

  @Roles('ADMINISTRATOR')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.lackService.toggleDelete(id, req);
  }
}
