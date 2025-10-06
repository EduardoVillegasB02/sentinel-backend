import { BadRequestException, Injectable } from '@nestjs/common';
import { Rol, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';
import { SearchDto } from '../../common/dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, rol: Rol): Promise<User> {
    const { password, ...res } = dto;
    const user = await this.prisma.user.create({
      data: {
        ...res,
        password: bcrypt.hashSync(password, 10),
        rol,
        created_at: timezoneHelper(),
        updated_at: timezoneHelper(),
      },
    });
    return await this.getUserById(user.id);
  }

  async findAll(dto: SearchDto, rol: Rol): Promise<any> {
    const { search, ...pagination } = dto;
    const where: any = { rol, deleted_at: null };
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
      ];
    return await paginationHelper(
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
  }

  async findOne(id: string, rol: Rol): Promise<User> {
    return await this.getUserById(id, false, rol);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const { password, ...res } = dto;
    await this.getUserById(id);
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
    return await this.getUserById(id);
  }

  async delete(id: string): Promise<User> {
    await this.getUserById(id);
    await this.prisma.user.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
    return await this.getUserById(id, true);
  }

  private async getUserById(
    id: string,
    isDeleted: boolean = false,
    rol: Rol | null = null,
  ): Promise<any> {
    const where = rol ? { id, rol } : { id };
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
    if (isDeleted) return user;
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.deleted_at) throw new BadRequestException('Usuario eliminado');
    return user;
  }
}
