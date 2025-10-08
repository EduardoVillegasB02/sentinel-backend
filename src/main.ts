import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'log', 'verbose', 'warn'],
  });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use('/static', express.static(join(process.cwd(), 'client')));
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;
  await app.listen(port ?? 3000);
  const logger = new Logger('Bootstrap');
  logger.verbose(`Server running on port ${port}`);
}
bootstrap();
