import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { CashesModule } from './modules/cashes/cashes.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import IsAuthenticated from './middlewares/isAuthenticated';

import { ScheduleModule } from '@nestjs/schedule';
import DatabaseService from './services/database/database.service';
import { TasksService } from './services/tasks/cron.service';
import { BankModule } from './modules/bank/bank.module';
@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    ProductsModule,
    CashesModule,
    IntegrationsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot({}),
    BankModule,
  ],
  providers: [DatabaseService, TasksService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsAuthenticated)
      .exclude(
        { path: 'users/auth', method: RequestMethod.POST },
        { path: 'users/gettoken/:code', method: RequestMethod.GET },
        { path: 'users', method: RequestMethod.POST },
        { path: 'users/ranking', method: RequestMethod.GET },
        { path: 'products/:id', method: RequestMethod.GET },
        { path: 'users/recovery', method: RequestMethod.ALL },
        { path: 'payments', method: RequestMethod.POST },
        { path: 'payments/notify', method: RequestMethod.POST },
        { path: 'payments/:id', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}