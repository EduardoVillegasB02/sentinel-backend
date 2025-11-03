import { createKeyv } from '@keyv/redis';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';
import { CacheService } from './cache.service';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    CacheService,
    {
      provide: 'CACHE_INSTANCE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        const ttl = config.get<string>('REDIS_TTL');
        const secondary = createKeyv(url);
        return new Cacheable({ secondary, ttl });
      },
    },
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<any> => {
        const url = config.get<string>('REDIS_URL');
        const logger = new Logger('Cache');
        const client = createClient({ url });
        client.on('error', (err) => logger.error('Redis Client Error:', err));
        try {
          await client.connect();
          logger.log(`Redis conectado: ${url}`);
        } catch (err) {
          logger.warn(
            `No se pudo conectar a Redis (${url}) — usando modo sin Redis`,
          );
        }
        return client;
      },
    },
  ],
  exports: ['CACHE_INSTANCE', 'REDIS_CLIENT', CacheService],
})
export class CacheModule {}
