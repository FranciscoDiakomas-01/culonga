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

  // 🔥 CORS TOTALMENTE ABERTO
  app.enableCors({
    origin: true, // ✅ PERMITE QUALQUER ORIGEM
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: '*', // ✅ PERMITE QUALQUER HEADER
  });

  // Relaxa o Helmet também
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false, // ✅ DESABILITA CSP
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
  Logger.log(`🔓 CORS TOTALMENTE LIBERADO - QUALQUER ORIGEM`, 'CORS');

  const starUp = new AdmminStartUpService();
  await starUp.createDefaultAdmin();
}

bootstrap();
