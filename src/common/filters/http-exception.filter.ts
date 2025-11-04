import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Action, Model, Status } from '@prisma/client';
import { Request } from 'express';
import { AuditService } from '../../modules/audit/audit.service';
import { getIP } from '../helpers';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('Audit');
  constructor(
    private readonly auditService: AuditService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req: any = ctx.getRequest<Request>();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()['message'] || exception.message
        : exception.message || 'Internal Server Error';
    const responseBody = { message };
    const method = req.method;
    const params = req.params;
    const baseUrl = req.baseUrl || req.url;
    const user_id = req.user ? req.user.user_id : null;
    const modelKey = Object.keys(Model).find((m) =>
      baseUrl.toUpperCase().includes(m),
    ) as Model | undefined;
    const model = modelKey ?? Model.USER;
    const action =
      method === 'POST'
        ? Action.CREATE
        : method === 'PATCH'
          ? Action.UPDATE
          : method === 'DELETE'
            ? Action.DELETE
            : params?.id
              ? Action.GET_ONE
              : Action.GET_ALL;
    const register_id =
      ['GET', 'PATCH', 'DELETE'].includes(method) && params?.id
        ? String(params.id)
        : undefined;
    let description = 'Error inesperado';
    let auditStatus: Status = Status.FAILED;
    if (exception instanceof UnauthorizedException) {
      auditStatus = Status.BLOCKED;
      description = 'Acceso no autorizado';
    } else if (exception instanceof ForbiddenException) {
      auditStatus = Status.BLOCKED;
      description = 'Acceso prohibido por rol';
    } else if (exception instanceof HttpException)
      description = `Error: ${exception.message}`;
    else if (exception instanceof Error)
      description = `Error: ${exception.message}`;
    try {
      await this.auditService.auditAuth({
        ip: getIP(req),
        status: auditStatus,
        description,
        register_id,
        model,
        action,
        user_id,
      });
    } catch (error) {
      this.logger.error('Error el registro de auditoría:', error);
    }
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
