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
} from '@nestjs/common';

import { ReportService } from './report.service';
import { CreateReportDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guard';
import { SuccessMessage } from 'src/common/decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @SuccessMessage('Mensaje generado exitosamente')
  create(@Body() dto: CreateReportDto, @Req() req: any) {
    return this.reportService.create(dto, req.user);
  }
}
