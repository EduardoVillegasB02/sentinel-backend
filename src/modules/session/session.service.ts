import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSessionDto, DeactivateSessionDto } from './dto';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class SessionService {
  private prefix: string;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.prefix = this.config.get<string>('REDIS_KEY1') || '';
  }

  async create(dto: CreateSessionDto): Promise<any> {
    const { id, ip, token } = dto;
    await this.redis.sadd(id, ip);
    await this.redis.expire(id);
    await this.redis.set(`${id}:${ip}`, token);
  }

  async findOne(id: string, ip: string, token: string | null): Promise<void> {
    const store = await this.redis.get(`${id}:${ip}`);
    if (!store || store !== token)
      throw new UnauthorizedException('Sesión finalizada, vuelva a ingresar');
  }

  async findAll(users: any[]): Promise<any> {
    for (const user of users) {
      const ips = await this.redis.smembers(user.id);
      if (!ips.length) {
        user.sessions = null;
        continue;
      }
      const tokens = await this.redis.mget(
        ips.map((ip) => `${this.prefix}:${user.id}:${ip}`),
      );
      ips.map((ip, i) => (tokens[i] ? { ip } : null)).filter(Boolean);
      user.sessions = ips;
    }
    return users;
  }

  async deactivate(dto: DeactivateSessionDto): Promise<any> {
    const { user_id, ip } = dto;
    await this.redis.delete(`${user_id}:${ip}`);
    await this.redis.srem(user_id, ip);
    return { success: true };
  }

  async deactivateAll(id: string): Promise<void> {
    const ips = await this.redis.smembers(id);
    if (!ips.length) return;
    const sessionKeys = ips.map(ip => `${id}:${ip}`);
    await this.redis.rmembers(sessionKeys);
    for (const ip of ips)
      await this.redis.srem(id, ip);
  }

  async getActiveIps(id: string): Promise<any> {
    return await this.redis.smembers(id);
  }
}
