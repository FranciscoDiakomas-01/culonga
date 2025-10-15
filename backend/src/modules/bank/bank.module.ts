import DatabaseService from 'src/services/database/database.service';
import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';

@Module({
  controllers: [BankController],
  providers: [BankService , DatabaseService],
})
export class BankModule {}
