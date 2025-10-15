import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [TransferController],
  providers: [TransferService, DatabaseService],
})
export class TransferModule {}
