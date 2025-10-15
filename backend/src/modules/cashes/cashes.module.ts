import { Module } from '@nestjs/common';
import { CashesService } from './cashes.service';
import { CashesController } from './cashes.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [CashesController],
  providers: [CashesService , DatabaseService],
})
export class CashesModule {}
