import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto, UpdateUserDto } from '../user/dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../auth/guard';
import { SearchDto } from '../../common/dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATOR', 'SUPERVISOR')
@Controller('sentinel')
export class SentinelController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: any) {
    return this.userService.create(dto, 'SENTINEL', req);
  }

  @Get()
  findAll(@Query() dto: SearchDto, @Req() req: any) {
    return this.userService.findAll(dto, 'SENTINEL', req);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.userService.findOne(id, 'SENTINEL', req);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.userService.update(id, dto, req);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.userService.toggleDelete(id, req);
  }
}
