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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BodycamService } from './bodycam.service';
import { CreateBodycamDto, UpdateBodycamDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bodycam')
export class BodycamController {
  constructor(private readonly bodycamService: BodycamService) {}

  @Roles('administrator')
  @Post()
  create(@Body() dto: CreateBodycamDto) {
    return this.bodycamService.create(dto);
  }

  @Get()
  findAll(@Query() dto: SearchDto) {
    return this.bodycamService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bodycamService.findOne(id);
  }

  @Roles('administrator')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBodycamDto,
  ) {
    return this.bodycamService.update(id, dto);
  }

  @Roles('administrator')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.bodycamService.delete(id);
  }

  @Roles('administrator')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  bulkUpload(@UploadedFile() file: Express.Multer.File) {
    return this.bodycamService.bulkUpload(file);
  }
}
