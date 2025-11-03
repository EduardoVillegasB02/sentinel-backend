import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Action } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import { JwtPayload } from './interfaces';
import { CacheService } from '../cache/cache.service';
import { AuditService } from '../modules/audit/audit.service';
import { SessionService } from '../modules/session/session.service';
import { getIP } from '../common/helpers';

@Injectable()
export class AuthService {
  constructor(
    private auditService: AuditService,
    private redis: CacheService,
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
    const auditData = { ip, action: Action.LOGIN };
    if (!user) {
      await this.auditService.auditAuth({
        ...auditData,
        status: 'FAILED',
        description: 'Usuario no encontrado',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (user.deleted_at) {
      await this.auditService.auditAuth({
        ...auditData,
        status: 'BLOCKED',
        description: 'Usuario eliminado',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      await this.auditService.auditAuth({
        ...auditData,
        status: 'FAILED',
        description: 'Contraseña incorrecta',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const activeIps = await this.redis.smembers(username);
    if (!activeIps.includes(ip)) {
      if (activeIps.length >= user.max_ips) {
        await this.auditService.auditAuth({
          ...auditData,
          status: 'BLOCKED',
          description: 'Límite de IPs alcanzado',
        });
        throw new UnauthorizedException(
          `Se alcanzó el máximo de ${user.max_ips} IPs activas permitidas`,
        );
      }
      await this.redis.sadd(username, ip);
      await this.redis.expire(username);
    }
    const { id } = user;
    const token = await this.getJwtToken({ sub: id });
    await this.redis.set(
      `${username}:${ip}`,
      JSON.stringify({ ip, token }),
      true,
    );
    await this.sessionService.create({ ip, token, user_id: id });
    await this.auditService.auditAuth({
      ...auditData,
      status: 'SUCCESS',
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
    await this.redis.delete(`${username}:${ip}`, true);
    await this.redis.srem(username, ip);
    await this.auditService.auditAuth({
      ip,
      action: 'LOGOUT',
      status: 'SUCCESS',
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
