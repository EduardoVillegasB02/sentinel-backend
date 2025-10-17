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
import { CreateReportDto, UpdateReportDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SuccessMessage } from '../../common/decorators';
import { SearchDto } from '../../common/dto';
import { imageFileFilter } from '../../common/filters';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @SuccessMessage('Mensaje generado exitosamente')
  create(@Body() dto: CreateReportDto, @Req() req: any) {
    return this.reportService.create(dto, req.user);
  }

  @Get()
  findAll(@Query() dto: SearchDto) {
    return this.reportService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.findOne(id);
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
  ) {
    return this.reportService.update(id, dto, files, descriptions);
  }

  @Roles('administrator')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.delete(id);
  }
}
