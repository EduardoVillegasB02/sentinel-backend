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
  Res,
  Query,
} from '@nestjs/common';

import { ReportService } from './report.service';
import { CreateReportDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guard';
import { SuccessMessage } from '../../common/decorators';
import { SearchDto } from '../../common/dto';

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
}
