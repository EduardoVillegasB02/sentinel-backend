import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, FilterAttendanceDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guard';
import { SuccessMessage } from '../../common/decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @SuccessMessage('Inasistencias creadas exitosamente')
  @Post()
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Get()
  findAll(@Query() dto: FilterAttendanceDto) {
    return this.attendanceService.findAll(dto);
  }
}
