import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module';
import { configureApp } from './app.config';
import { NestExpressApplication } from '@nestjs/platform-express';

if (existsSync('.env')) process.loadEnvFile();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
