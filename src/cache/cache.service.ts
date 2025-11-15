import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  private logger = new Logger('Cache');
  constructor(
    private readonly config: ConfigService,
    @Inject('CACHE_INSTANCE') private readonly cache: Cacheable,
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

  // Agregar a conjunto
  async sadd(key: string, value: string) {
    const cacheKey = this.getKey(key);
    const data = (await this.cache.get<string[]>(cacheKey)) || [];
    if (!data.includes(value)) {
      data.push(value);
      await this.cache.set(cacheKey, data);
    }
  }

  // Remover de conjunto
  async srem(key: string, value: string) {
    const cacheKey = this.getKey(key);
    const data = (await this.cache.get<string[]>(cacheKey)) || [];
    const newData = data.filter((v) => v !== value);
    await this.cache.set(cacheKey, newData);
  }

  // Obtener conjunto
  async smembers(key: string): Promise<string[]> {
    const cacheKey = this.getKey(key);
    return (await this.cache.get<string[]>(cacheKey)) || [];
  }

  async expire(key: string) {
    const ttl = this.config.get<string>('REDIS_TTL');
    if (!ttl) {
      this.logger.error('Variable de entorno no definida');
      return;
    }
    const seconds = Number(ttl[0]) * 3600;
    const cacheKey = this.getKey(key);
    const value = await this.cache.get(cacheKey);
    if (value) await this.cache.set(cacheKey, value, seconds * 1000);
  }

  private getKey(key: string, session: boolean = false) {
    const prefix1 = this.config.get<string>('REDIS_KEY1');
    const prefix2 = this.config.get<string>('REDIS_KEY2');
    if (!prefix1 || !prefix2)
      this.logger.error('Variables de entorno no definidas');
    return session ? `${prefix2}:${key}` : `${prefix1}:${key}`;
  }
}
