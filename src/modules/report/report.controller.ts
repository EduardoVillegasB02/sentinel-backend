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
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import { ReportService } from './report.service';
import { CreateMessageDto, CreateReportDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guard';
import { Response } from 'express';
import { pathToFileURL } from 'url';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('message')
  createMessage(@Body() dto: CreateMessageDto, @Req() req: any) {
    return this.reportService.createMessage(dto, req.user);
  }

  @Post('page')
  async page1(@Body() data: any, @Res() res: Response) {
    const logoPath = join(process.cwd(), 'client', 'logo.png');
    if (!existsSync(logoPath)) throw new Error('No se encontró ' + logoPath);
    const logoFileSrc = pathToFileURL(logoPath).href;
    const payload = { ...data, logoFileSrc };
    const templatePath = join(
      process.cwd(),
      'src',
      'modules',
      'report',
      'templates',
      'disciplinary-lack.hbs',
    );
    const templateHtml = readFileSync(templatePath, 'utf8');

    const pdf = await this.reportService.firstPagePdf(payload, templateHtml);

    const filename = payload?.header?.numero
      ? `informe-${payload.header.numero}-pag1.pdf`
      : 'informe-pag1.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  }
}
