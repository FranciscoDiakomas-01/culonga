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

  // Configuração CORS para seu domínio
  const allowedOrigins = [
    'https://app.culonga.com',
    'https://www.app.culonga.com', // se tiver www
    'https://culonga.com', // domínio principal se tiver
    'https://www.culonga.com', // www do domínio principal
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://app.culonga.com', // para testes em staging
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        Logger.warn(`CORS bloqueado para origem: ${origin}`, 'CORS');
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'token',
      'x-api-key',
      'x-requested-with',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Total-Pages', 'X-Token-Expired'],
  });

  app.setGlobalPrefix('culonga');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração segura do Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`🚀 Application running on port ${port}`, 'Bootstrap');
  Logger.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`, 'CORS');

  // Inicialização do admin
  const starUp = new AdmminStartUpService();
  await starUp.createDefaultAdmin();
}

bootstrap();
