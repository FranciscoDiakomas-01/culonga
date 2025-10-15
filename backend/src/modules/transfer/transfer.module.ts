import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';

@Module({
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
