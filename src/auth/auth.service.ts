import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Action, Model, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto';
import { JwtPayload } from './interfaces';
import { getIP } from '../common/helpers';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../modules/audit/audit.service';
import { SessionService } from '../modules/session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private auditService: AuditService,
    private cache: CacheService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async login(dto: LoginDto, req: any) {
    const { username, password } = dto;
    const ip = getIP(req);
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        max_ips: true,
        rol: true,
        deleted_at: true,
      },
    });
    const auditData = { ip, action: Action.LOGIN, model: Model.AUTH };
    if (!user) {
      await this.auditService.auditAuth({
        ...auditData,
        status: Status.BLOCKED,
        description: 'Usuario no encontrado',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (user.deleted_at) {
      await this.auditService.auditAuth({
        ...auditData,
        status: Status.BLOCKED,
        description: 'Usuario eliminado',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      await this.auditService.auditAuth({
        ...auditData,
        status: Status.FAILED,
        description: 'Contraseña incorrecta',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const activeIps = await this.cache.smembers(username);
    if (!activeIps.includes(ip)) {
      if (activeIps.length >= user.max_ips) {
        await this.auditService.auditAuth({
          ...auditData,
          status: Status.BLOCKED,
          description: 'Límite de IPs alcanzado',
        });
        throw new UnauthorizedException(
          `Se alcanzó el límite de IPs activas permitidas`,
        );
      }
      await this.cache.sadd(username, ip);
      await this.cache.expire(username);
    }
    const { id } = user;
    const token = await this.getJwtToken({ sub: id });
    await this.cache.set(`${username}:${ip}`, token, true);
    await this.sessionService.create({ ip, token, user_id: id });
    await this.auditService.auditAuth({
      ...auditData,
      status: Status.SUCCESS,
      description: 'Inicio de sesión exitoso',
      user_id: id,
    });
    return {
      user: username,
      rol: user.rol,
      token,
    };
  }

  async logout(req: any) {
    const { username, user_id } = req.user;
    const ip = getIP(req);
    await this.cache.delete(`${username}:${ip}`, true);
    await this.cache.srem(username, ip);
    await this.auditService.auditAuth({
      ip,
      action: Action.LOGOUT,
      model: Model.AUTH,
      status: Status.SUCCESS,
      description: 'Sesión cerrada',
      user_id,
    });
    return {
      user: username,
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }
}
