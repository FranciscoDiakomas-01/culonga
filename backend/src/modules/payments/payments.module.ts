import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService , DatabaseService],
})
export class PaymentsModule {}
