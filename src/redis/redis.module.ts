import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        //const ttl = Number(config.get<string>('REDIS_TTL'));
        const logger = new Logger('Redis');
        const client = createClient({ url });
        client.on('error', (err) => logger.error('Redis Client Error:', err));
        try {
          await client.connect();
          logger.verbose('Redis connected');
        } catch (error) {
          logger.warn('Unable to connect to Redis');
        }
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
