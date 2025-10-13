import { BadRequestException, Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import * as handlebars from 'handlebars';
import { CreateReportDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BodycamService } from '../bodycam/bodycam.service';
import { LackService } from '../lack/lack.service';
import { OffenderService } from '../offender/offender.service';
import { SubjectService } from '../subject/subject.service';
import { UserService } from '../user/user.service';
import { dateString } from './helpers';
import { timezoneHelper } from '../../common/helpers';

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

  async create(dto: CreateReportDto, req: any) {
    const bodycam = await this.bodycamService.findOne(dto.bodycam_id);
    const subject = await this.subjectSubject.findOne(dto.subject_id);
    if (subject.lacks && !dto.lack_id)
      throw new BadRequestException(
        'Este asunto admite necesariamente una falta',
      );
    const lack = dto.lack_id
      ? await this.lackService.findOne(dto.lack_id)
      : null;
    const user = await this.userService.findOne(req.user_id);
    const offender = await this.offenderService.create(dto.offender_dni);
    const cameraman =
      dto.bodycam_dni !== dto.offender_dni
        ? await this.offenderService.verifyPersonal(dto.bodycam_dni)
        : offender;
    const bodycam_user = `${cameraman.lastname} ${cameraman.name}`;
    const { date: dates, time } = dateString(new Date(dto.date));
    const compile = handlebars.compile(subject.content);
    const message = compile({
      bodycam,
      bodycam_user,
      lack,
      dates,
      offender,
      subject,
      time,
      user,
      ...dto,
    });
    const { header, bodycam_dni, offender_dni, ...res } = dto;
    await this.prisma.report.create({
      data: {
        ...res,
        bodycam_user,
        header: instanceToPlain(header),
        offender_id: offender.id,
        user_id: req.user_id,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return {
      message,
    };
  }
}
