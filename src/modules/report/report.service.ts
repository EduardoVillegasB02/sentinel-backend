import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, Report } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import * as handlebars from 'handlebars';
import { CreateReportDto, FilterReportDto, UpdateReportDto } from './dto';
import { buildReportSelect } from './helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BodycamService } from '../bodycam/bodycam.service';
import { EvidenceService } from '../evidence/evidence.service';
import { LackService } from '../lack/lack.service';
import { OffenderService } from '../offender/offender.service';
import { SubjectService } from '../subject/subject.service';
import { UserService } from '../user/user.service';
import {
  dateString,
  getShift,
  paginationHelper,
  timezoneHelper,
  verifyUpdateFiles,
} from '../../common/helpers';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly bodycamService: BodycamService,
    private readonly evidenceService: EvidenceService,
    private readonly lackService: LackService,
    private readonly offenderService: OffenderService,
    private readonly subjectSubject: SubjectService,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateReportDto, req: any) {
    const { user_id } = req.user;
    const bodycam = dto.bodycam_id
      ? await this.bodycamService.getBodycamById(dto.bodycam_id)
      : null;
    const lack = await this.lackService.getLackById(dto.lack_id);
    const subject = await this.subjectSubject.getSubjectById(dto.subject_id);
    const user = await this.userService.getUserById(user_id, req);
    const offender = await this.offenderService.create(dto.offender_dni);
    const cameraman =
      dto.bodycam_dni && dto.bodycam_dni !== dto.offender_dni
        ? await this.offenderService.verifyPersonal(dto.bodycam_dni)
        : offender;
    const bodycam_user = dto.bodycam_dni
      ? `${cameraman.lastname} ${cameraman.name}`
      : null;
    const { date: dates, time } = dateString(new Date(dto.date));
    const compile = handlebars.compile(lack.content);
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
        shift: getShift(),
        offender_id: offender.id,
        user_id: req.user_id,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.REPORT, id, req);
    return { id, message };
  }

  async findAll(dto: FilterReportDto, req: any): Promise<any> {
    const { search, jurisdiction, lack, shift, subject, ...pagination } = dto;
    const where: any = { deleted_at: null };
    if (search) {
      if (!where.offender) where.offender = {};
      where.offender.dni = { contains: search, mode: 'insensitive' };
    }
    if (lack) where.lack_id = lack;
    if (jurisdiction) where.jurisdiction_id = jurisdiction;
    if (shift) where.shift = shift;
    if (subject) where.subject_id = subject;
    const reports = await paginationHelper(
      this.prisma.report,
      {
        select: buildReportSelect({ relations: true }),
        where,
        orderBy: { created_at: 'desc' },
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.REPORT, req);
    return reports;
  }

  async findOne(id: string, req: any): Promise<Report> {
    const report = await this.getReportById(id);
    await this.auditService.auditGetOne(Model.REPORT, id, req);
    return report;
  }

  async update(
    id: string,
    dto: UpdateReportDto,
    files: Array<Express.Multer.File>,
    descriptions: string[] | string,
    req: any,
  ): Promise<Report> {
    const report = await this.getReportById(id, false);
    if (dto.bodycam_id)
      await this.bodycamService.getBodycamById(dto.bodycam_id);
    if (dto.subject_id)
      await this.subjectSubject.getSubjectById(dto.subject_id);
    const { header, bodycam_dni, offender_dni, ...res } = dto;
    await this.prisma.report.update({
      data: {
        ...res,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    verifyUpdateFiles(files, descriptions, report.evidences);
    if (files.length)
      await this.evidenceService.create(files, descriptions, id);
    await this.auditService.auditUpdate(Model.REPORT, dto, report, req);
    return await this.getReportById(id);
  }

  async delete(id: string, req: any): Promise<any> {
    await this.getReportById(id);
    //await this.auditService.auditDelete(Model.REPORT, id, req);
    await this.prisma.report.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getReportById(
    id: string,
    relation: Boolean = true,
  ): Promise<any> {
    const options = relation ? { relations: true } : { ids: true };
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: buildReportSelect(options),
    });
    if (!report) throw new BadRequestException('Informe no encontrado');
    if (report.deleted_at) throw new BadRequestException('Informe eliminado');
    return report;
  }
}
