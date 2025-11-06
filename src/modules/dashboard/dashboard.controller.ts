import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { FilterDashboardDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATOR')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  statistics(@Query() filters: FilterDashboardDto) {
    return this.dashboardService.getStatistics(filters);
  }
}
