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
import { SubjectService } from './subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Roles('administrator', 'supervisor')
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(dto);
  }

  @Get()
  findAll(@Query() dto: SearchDto) {
    return this.subjectService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectService.findOne(id);
  }

  @Roles('administrator', 'supervisor')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, dto);
  }

  @Roles('administrator', 'supervisor')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectService.delete(id);
  }
}
