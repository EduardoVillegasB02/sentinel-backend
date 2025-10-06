import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalService } from './external.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        baseURL: config.get<string>('EXTERNAL_API'),
        maxRedirects: config.get<number>('HTTP_MAX_REDIRECTS'),
        timeout: config.get<number>('HTTP_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ExternalService],
  exports: [ExternalService],
})
export class ExternalModule {}
