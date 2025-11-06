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
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATOR', 'SUPERVISOR')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    return this.userService.create(dto, req);
  }

  @Get()
  findAll(@Query() dto: SearchDto, @Req() req: Request) {
    return this.userService.findAll(dto, req);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.userService.findOne(id, req);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.update(id, dto, req);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.userService.toggleDelete(id, req);
  }
}
