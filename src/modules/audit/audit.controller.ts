import { Controller, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FilterAuditDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATOR')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Body() dto: FilterAuditDto, @Req() req: Request) {
    return this.auditService.findAll(dto, req);
  }
}
