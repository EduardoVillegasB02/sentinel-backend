import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import * as handlebars from 'handlebars';
import { CreateMessageDto, CreateReportDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BodycamService } from '../bodycam/bodycam.service';
import { LackService } from '../lack/lack.service';
import { OffenderService } from '../offender/offender.service';
import { SubjectService } from '../subject/subject.service';
import { UserService } from '../user/user.service';
import { dateString } from './helpers';
import { message } from './helpers';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bodycamService: BodycamService,
    private readonly lackService: LackService,
    private readonly offenderService: OffenderService,
    private readonly subjectSubject: SubjectService,
    private readonly userService: UserService,
  ) {}

  async createMessage(dto: CreateMessageDto, req: any) {
    const bodycam = await this.bodycamService.findOne(dto.bodycam_id);
    const lack = await this.lackService.findOne(dto.lack_id);
    const subject = await this.subjectSubject.findOne(dto.subject_id);
    const offender = await this.offenderService.verifyPersonal(
      dto.offender_dni,
    );
    const user = await this.userService.findOne(req.user_id);
    const { date, time } = dateString(new Date(dto.date));
    const fields = {
      address: dto.address,
      bodycam: bodycam.name,
      date,
      time,
      lack,
      holder: 'PIPO',
      offender,
      user,
    };
    return message(date, subject.name, fields);
  }

  async createReport(dto: CreateReportDto, req: any) {
    
  }

  private compile(template: string, data: any) {
    const h = handlebars.compile(template, { noEscape: true });
    return h(data);
  }

  async firstPagePdf(payload: any, templateHtml: string) {
    const html = this.compile(templateHtml, payload);

    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '20mm', right: '20mm' },
    });

    await browser.close();
    return pdf;
  }
}
