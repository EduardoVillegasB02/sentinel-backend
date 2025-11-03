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
import { LeadService } from './lead.service';
import { CreateLeadDto, FilterLeadDto, UpdateLeadDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Roles('ADMINISTRATOR', 'SUPERVISOR')
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto);
  }

  @Get()
  findAll(@Query() dto: FilterLeadDto) {
    return this.leadService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadService.findOne(id);
  }

  @Roles('ADMINISTRATOR', 'SUPERVISOR')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLeadDto) {
    return this.leadService.update(id, dto);
  }

  @Roles('ADMINISTRATOR', 'SUPERVISOR')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadService.delete(id);
  }
}
