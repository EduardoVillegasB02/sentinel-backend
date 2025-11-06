import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ReportService } from './report.service';
import { CreateReportDto, FilterReportDto, UpdateReportDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SuccessMessage } from '../../common/decorators';
import { imageFileFilter } from '../../common/filters';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @SuccessMessage('Mensaje generado exitosamente')
  create(@Body() dto: CreateReportDto, @Req() req: Request) {
    return this.reportService.create(dto, req);
  }

  @Get()
  findAll(@Query() dto: FilterReportDto, @Req() req: Request) {
    return this.reportService.findAll(dto, req);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.reportService.findOne(id, req);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('descriptions') descriptions: string[] | string,
    @Body() dto: UpdateReportDto,
    @Req() req: Request,
  ) {
    if (typeof descriptions === 'string') descriptions = [descriptions];
    return this.reportService.update(id, dto, files, descriptions, req);
  }

  @Roles('ADMINISTRATOR')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.reportService.delete(id, req);
  }
}
