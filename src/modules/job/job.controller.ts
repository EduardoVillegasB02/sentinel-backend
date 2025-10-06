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
import { JobService } from './job.service';
import { CreateJobDto, UpdateJobDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Roles('administrator', 'supervisor')
  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobService.create(dto);
  }

  @Get()
  findAll(@Query() dto: SearchDto) {
    return this.jobService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobService.findOne(id);
  }

  @Roles('administrator', 'supervisor')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateJobDto) {
    return this.jobService.update(id, dto);
  }

  @Roles('administrator', 'supervisor')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobService.delete(id);
  }
}
