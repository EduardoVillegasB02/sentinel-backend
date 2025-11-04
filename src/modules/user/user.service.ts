import { BadRequestException, Injectable } from '@nestjs/common';
import { Action, Model, Rol, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';
import { SearchDto } from '../../common/dto';

@Injectable()
export class UserService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto, role: Rol, req: any): Promise<User> {
    const { password, ...res } = dto;
    const user = await this.prisma.user.create({
      data: {
        ...res,
        password: bcrypt.hashSync(password, 10),
        rol: role,
        max_ips: 1,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    await this.auditService.auditCreate(Model.USER, user.id, req);
    return await this.getUserById(user.id);
  }

  async findAll(dto: SearchDto, rol: Rol, req: any): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { rol, deleted_at: null };
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
      ];
    const users = await paginationHelper(
      this.prisma.user,
      {
        select: {
          id: true,
          name: true,
          lastname: true,
          dni: true,
          phone: true,
          username: true,
        },
        where,
        orderBy: { lastname: 'asc' },
      },
      pagination,
    );
    await this.auditService.auditGetAll(Model.USER, req);
    return users;
  }

  async findOne(id: string, role: Rol, req: any): Promise<User> {
    const { rol } = req.user;
    const user = await this.getUserById(id, role);
    await this.auditService.auditGetOne(Model.USER, id, req);
    return user;
  }

  async update(id: string, dto: UpdateUserDto, req: any): Promise<User> {
    const { password, ...res } = dto;
    const user = await this.getUserById(id);
    const data = password
      ? {
          password: bcrypt.hashSync(password, 10),
          update_at: timezoneHelper(),
          ...res,
        }
      : { update_at: timezoneHelper(), ...res };
    await this.prisma.user.update({
      data,
      where: { id },
    });
    await this.auditService.auditUpdate(Model.USER, dto, user, req);
    return await this.getUserById(id);
  }

  async toggleDelete(id: string, req: any): Promise<any> {
    const { rol } = req.user;
    const user = await this.getUserById(id, null, rol);
    const inactive = user.deleted_at;
    const deleted_at = inactive ? null : timezoneHelper();
    await this.prisma.user.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at,
      },
      where: { id },
    });
    await this.auditService.auditDelete(Model.USER, id, inactive, req);
    return {
      action: inactive ? Action.RESTORE : Action.DELETE,
      id,
    };
  }
  async getUserById(
    id: string,
    role: Rol | null = null,
    rol: Rol | null = null,
  ): Promise<any> {
    const where = role ? { id, role } : { id };
    const user = await this.prisma.user.findUnique({
      where,
      select: {
        name: true,
        lastname: true,
        username: true,
        email: true,
        dni: true,
        phone: true,
        deleted_at: true,
      },
    });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (rol !== Rol.ADMINISTRATOR && user.deleted_at)
      throw new BadRequestException('Usuario eliminado');
    return user;
  }
}
