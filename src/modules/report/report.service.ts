import { BadRequestException, Injectable } from '@nestjs/common';
import { Report } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import * as handlebars from 'handlebars';
import { CreateReportDto, UpdateReportDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BodycamService } from '../bodycam/bodycam.service';
import { EvidenceService } from '../evidence/evidence.service';
import { LackService } from '../lack/lack.service';
import { OffenderService } from '../offender/offender.service';
import { SubjectService } from '../subject/subject.service';
import { UserService } from '../user/user.service';
import {
  dateString,
  paginationHelper,
  timezoneHelper,
  verifyUpdateFiles,
} from '../../common/helpers';
import { SearchDto } from '../../common/dto';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bodycamService: BodycamService,
    private readonly evidenceService: EvidenceService,
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
    const { id } = await this.prisma.report.create({
      data: {
        ...res,
        bodycam_user,
        header: instanceToPlain(header),
        message,
        offender_id: offender.id,
        user_id: req.user_id,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return { id, message };
  }

  async findAll(dto: SearchDto): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) where.bodycam_user = { contains: search, mode: 'insensitive' };
    return await paginationHelper(
      this.prisma.report,
      {
        select: {
          id: true,
          address: true,
          date: true,
          bodycam_user: true,
          header: true,
          latitude: true,
          longitude: true,
          message: true,
          bodycam: true,
          lack: true,
          evidences: true,
          offender: true,
          subject: {
            select: { id: true, name: true },
          },
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              lastname: true,
              email: true,
              dni: true,
              phone: true,
            },
          },
        },
        where,
        orderBy: { created_at: 'desc' },
      },
      pagination,
    );
  }

  async findOne(id: string): Promise<Report> {
    return await this.getReportById(id);
  }

  async update(
    id: string,
    dto: UpdateReportDto,
    files: Array<Express.Multer.File>,
    descriptions: string[] | string,
  ): Promise<Report> {
    const { evidences } = await this.getReportById(id);
    if (dto.bodycam_id) await this.bodycamService.findOne(dto.bodycam_id);
    if (dto.subject_id) await this.subjectSubject.findOne(dto.subject_id);
    const { header, bodycam_dni, offender_dni, ...res } = dto;
    await this.prisma.report.update({
      data: {
        ...res,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    verifyUpdateFiles(files, descriptions, evidences);
    if (files.length)
      await this.evidenceService.create(files, descriptions, id);
    return await this.getReportById(id);
  }

  async delete(id: string): Promise<any> {
    await this.getReportById(id);
    await this.prisma.report.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getReportById(id: string): Promise<any> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        date: true,
        bodycam_user: true,
        header: true,
        latitude: true,
        longitude: true,
        message: true,
        bodycam: true,
        lack: true,
        offender: true,
        subject: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            lastname: true,
            email: true,
            dni: true,
            phone: true,
          },
        },
        evidences: {
          where: { deleted_at: null },
        },
        deleted_at: true,
      },
    });
    if (!report) throw new BadRequestException('Informe no encontrado');
    if (report.deleted_at) throw new BadRequestException('Informe eliminado');
    return report;
  }
}
