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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BodycamService } from './bodycam.service';
import { CreateBodycamDto, UpdateBodycamDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bodycam')
export class BodycamController {
  constructor(private readonly bodycamService: BodycamService) {}

  @Roles('ADMINISTRATOR')
  @Post()
  create(@Body() dto: CreateBodycamDto, @Req() req: Request) {
    return this.bodycamService.create(dto, req);
  }

  @Get()
  findAll(@Query() dto: SearchDto, @Req() req: Request) {
    return this.bodycamService.findAll(dto, req);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.bodycamService.findOne(id, req);
  }

  @Roles('ADMINISTRATOR')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBodycamDto,
    @Req() req: Request,
  ) {
    return this.bodycamService.update(id, dto, req);
  }

  @Roles('ADMINISTRATOR')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.bodycamService.toggleDelete(id, req);
  }

  @Roles('ADMINISTRATOR')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  bulkUpload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    return this.bodycamService.bulkUpload(file, req);
  }
}
