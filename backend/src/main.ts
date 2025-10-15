import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
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
        prefix: 'NublaPay',
      }),
    },
  );
  app.enableCors();
  app.setGlobalPrefix('nublapay');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(helmet());
  await app.listen(process.env.PORT ?? 3000);
  const starUp = new AdmminStartUpService()
  await starUp.createDefaultAdmin()
}
bootstrap();
