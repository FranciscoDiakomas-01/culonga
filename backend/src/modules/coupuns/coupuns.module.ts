import { Module } from '@nestjs/common';
import { CoupunsService } from './coupuns.service';
import { CoupunsController } from './coupuns.controller';

@Module({
  controllers: [CoupunsController],
  providers: [CoupunsService],
})
export class CoupunsModule {}
