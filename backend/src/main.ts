import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConsoleLogger, ValidationPipe, Logger } from '@nestjs/common';
import {
  NestExpressApplication,
  ExpressAdapter,
} from '@nestjs/platform-express';
import AdmminStartUpService from './services/tasks/bostrap.admin';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      logger: new ConsoleLogger({
        prefix: 'Culonga',
      }),
    },
  );

  // Configuração CORS simplificada e eficaz
  const allowedOrigins = [
    'https://app.culonga.com',
    'https://www.app.culonga.com',
    'https://culonga.com',
    'https://www.culonga.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ];

  // 🔥 CONFIGURAÇÃO CORS SIMPLIFICADA
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'token',
      'x-api-key',
      'x-requested-with',
    ],
  });

  // 🔥 CONFIGURAÇÃO SEGURA DO HELMET
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.setGlobalPrefix('culonga');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`🚀 Application running on port ${port}`, 'Bootstrap');
  Logger.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`, 'CORS');

  const starUp = new AdmminStartUpService();
  await starUp.createDefaultAdmin();
}

bootstrap();
