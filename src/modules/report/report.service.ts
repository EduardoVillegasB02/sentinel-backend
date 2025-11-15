import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Model, Process, Report, Rol } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import * as handlebars from 'handlebars';
import { CreateReportDto, FilterReportDto, UpdateReportDto } from './dto';
import { buildSelectReport } from './helpers';
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
  getCurrentYear,
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
        user_id,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.REPORT, id, req);
    return { id, message };
  }

  async findAll(dto: FilterReportDto, req: any): Promise<any> {
    const { rol } = req.user;
    const { search, jurisdiction, lack, shift, subject, ...pagination } = dto;
    const where: any = rol !== Rol.ADMINISTRATOR ? { deleted_at: null } : {};
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
        select: buildSelectReport({ relations: true }),
        where,
        orderBy: { created_at: 'desc' },
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.REPORT, req);
    return reports;
  }

  async findOne(id: string, req: any): Promise<Report> {
    const { rol } = req.user;
    const report = await this.getReportById(id, { rol });
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
    const { rol } = req.user;
    const report = await this.getReportById(id);
    if (rol === Rol.VALIDATOR && !report.process)
      throw new BadRequestException(
        'El informe aún no fue enviado, usted no puede actualizar',
      );

    if (report.process) {
      if (rol === Rol.SENTINEL)
        throw new BadRequestException(
          'El informe ya fue enviado, usted no puede actualizar',
        );

      if (rol === Rol.VALIDATOR && report.process !== Process.PENDING)
        throw new BadRequestException(
          'El informe ya fue validado, usted no puede actualizar',
        );
    }
    if (dto.bodycam_id)
      await this.bodycamService.getBodycamById(dto.bodycam_id);
    if (dto.subject_id)
      await this.subjectSubject.getSubjectById(dto.subject_id);
    if (dto.lack_id) await this.lackService.getLackById(dto.lack_id);
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

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const report = await this.getReportById(id, { rol });
    const inactive = report.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.report.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at,
      },
      where: { id },
    });
    await this.auditService.auditDelete(Model.REPORT, id, inactive, req);
    return {
      action: inactive ? Action.RESTORE : Action.DELETE,
      id,
    };
  }

  async send(id: string, req: any): Promise<any> {
    const report = await this.getReportById(id);
    if (report.evidences.length === 0)
      throw new BadRequestException('El informe debe presentar evidencias');
    if (report.process)
      throw new BadRequestException('El informe ya ha sido enviado');
    await this.prisma.report.update({
      data: {
        process: Process.PENDING,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditSend(id, req);
    return { id };
  }

  async validate(id: string, approved: Boolean, req: any): Promise<any> {
    const report = await this.getReportById(id);
    if (!report.process)
      throw new BadRequestException('El informe aún no se ha enviado');
    if (report.process !== Process.PENDING)
      throw new BadRequestException('El informe ya fue validado');
    let code: string | null = null;
    if (approved) {
      const year = getCurrentYear().toString();
      console.log(year);
      const codes = await this.prisma.report.findMany({
        select: { code: true },
        where: { code: { endsWith: year } },
        orderBy: { code: 'desc' },
      });
      const lastCode = codes[0]?.code?.split('-')[0] ?? '0';
      const codeNumber = Number(lastCode) + 1;
      const format = codeNumber.toString().padStart(3, '0');
      code = `${format}-${year}`;
    }
    await this.prisma.report.update({
      data: {
        code,
        process: approved ? Process.APPROVED : Process.REJECTED,
        updated_at: timezoneHelper(),
      },
      where: { id },
    });
    await this.auditService.auditValidate(id, approved, req);
    return { id, state: approved, code };
  }

  async getByRange(dto: FilterReportDto, req: any) {
    const { lack, start, end } = dto;
    if (!lack || !start || !end)
      throw new BadRequestException('Es necesario enviar el rango y la falta');
    await this.lackService.getLackById(lack);
    const date_start = new Date(`${start}T00:00:00.000Z`);
    const date_end = new Date(`${end}T23:59:59.999Z`);
    const reports = await this.prisma.report.findMany({
      where: {
        lack_id: lack,
        date: {
          gte: date_start,
          lte: date_end,
        },
      },
      select: { date: true, offender: true, offender_id: true },
      orderBy: { date: 'asc' },
    });
    const response: any = [];
    for (const report of reports) {
      const offender_id = report.offender_id;
      const match = response.find((r) => r.id === offender_id);
      const date = report.date.toISOString().split('T')[0];
      if (match) {
        match.dates.push(date);
        continue;
      }
      const { id, name, lastname, dni, job, regime, shift } = report.offender;
      response.push({
        id,
        name,
        lastname,
        dni,
        job,
        regime,
        shift,
        dates: [date],
      });
    }
    await this.auditService.auditGetAll(Model.REPORT, req);
    return response;
  }

  private async getReportById(
    id: string,
    options?: {
      rol?: Rol | null;
      relation?: Boolean;
    },
  ): Promise<any> {
    const { rol = null, relation = true } = options || {};
    const select = relation ? { relations: true } : { ids: true };
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: buildSelectReport(select),
    });
    if (!report) throw new BadRequestException('Informe no encontrado');
    if (rol !== Rol.ADMINISTRATOR && report.deleted_at)
      throw new BadRequestException('Informe eliminado');
    return report;
  }
}
