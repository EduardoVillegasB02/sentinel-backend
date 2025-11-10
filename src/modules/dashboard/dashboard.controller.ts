import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { FilterDashboardDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATOR', 'SUPERVISOR')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('general')
  genera(@Query() filters: FilterDashboardDto) {
    return this.dashboardService.getGeneral(filters);
  }

  @Get('trends')
  trends(@Query() filters: FilterDashboardDto) {
    return this.dashboardService.getTrends(filters);
  }
}
