import { createKeyv } from '@keyv/redis';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';
import { CacheService } from './cache.service';

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
  ],
  exports: ['CACHE_INSTANCE', CacheService],
})
export class CacheModule {}
