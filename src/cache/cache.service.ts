import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';
import { RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private logger = new Logger('Cache');
  constructor(
    private readonly config: ConfigService,
    @Inject('CACHE_INSTANCE') private readonly cache: Cacheable,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async set(key: string, value: string, session: boolean = false) {
    return await this.cache.set(this.getKey(key, session), value);
  }

  async get(key: string, session: boolean = false) {
    return await this.cache.get(this.getKey(key, session));
  }

  async delete(key: string, session: boolean = false) {
    return await this.cache.delete(this.getKey(key, session));
  }

  async rPush(key: string, value: string) {
    await this.redis.rPush(this.getKey(key), value);
  }

  async lTrim(key: string, start: number, end: number) {
    await this.redis.lTrim(this.getKey(key), start, end);
  }

  async lRange(key: string, start: number, end: number): Promise<string[]> {
    return this.redis.lRange(this.getKey(key), start, end);
  }

  async sadd(key: string, value: string) {
    await this.redis.sAdd(this.getKey(key), value);
  }

  async srem(key: string, value: string) {
    await this.redis.sRem(this.getKey(key), value);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.sMembers(this.getKey(key));
  }

  async expire(key: string) {
    const ttl = this.config.get<string>('REDIS_TTL');
    if (!ttl) {
      this.logger.error('Variable de entorno no definida');
      return;
    }
    const seconds = Number(ttl[0]) * 3600;
    await this.redis.expire(this.getKey(key), seconds);
  }

  private getKey(key: string, session: boolean = false) {
    const prefix1 = this.config.get<string>('REDIS_KEY1');
    const prefix2 = this.config.get<string>('REDIS_KEY2');
    if (!prefix1 || !prefix2)
      this.logger.error('Variables de entorno no definidas');
    return session ? `${prefix2}:${key}` : `${prefix1}:${key}`;
  }
}
