import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private logger = new Logger('Redis');
  private ttl: number;
  private expiration: { expiration: { type: 'EX'; value: number } };

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly config: ConfigService,
  ) {
    this.ttl = Number(this.config.get<string>('REDIS_TTL')) || 3600;
    this.expiration = { expiration: { type: 'EX', value: this.ttl } };
  }

  async set(key: string, value: string) {
    return await this.redis.set(this.getKey(key, true), value, this.expiration);
  }

  async get(key: string) {
    return await this.redis.get(this.getKey(key, true));
  }

  async delete(key: string) {
    return await this.redis.del(this.getKey(key, true));
  }

  // Agregar a conjunto
  async sadd(key: string, value: string) {
    return await this.redis.sAdd(this.getKey(key), value);
  }

  // Remover de conjunto
  async srem(key: string, value: string) {
    return await this.redis.sRem(this.getKey(key), value);
  }

  // Obtener conjunto
  async smembers(key: string) {
    return await this.redis.sMembers(this.getKey(key));
  }

  // Remover conjunto
  async rmembers(keys: string[]) {
    const prefixed = keys.map(key => this.getKey(key, true));
    return await this.redis.del(prefixed);
  }

  // Expiracion de key
  async expire(key: string) {
    return await this.redis.expire(this.getKey(key), this.ttl);
  }

  // Obtener store de diferentes keys
  async mget(keys: string[]) {
    return await this.redis.mGet(keys);
  }

  private getKey(key: string, session: boolean = false) {
    const prefix1 = this.config.get<string>('REDIS_KEY1');
    const prefix2 = this.config.get<string>('REDIS_KEY2');
    if (!prefix1 || !prefix2)
      this.logger.error('Variables de entorno no definidas');
    return session ? `${prefix2}:${key}` : `${prefix1}:${key}`;
  }
}
