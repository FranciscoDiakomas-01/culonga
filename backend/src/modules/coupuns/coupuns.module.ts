import { Module } from '@nestjs/common';
import { CoupunsService } from './coupuns.service';
import { CoupunsController } from './coupuns.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [CoupunsController],
  providers: [CoupunsService, DatabaseService],
})
export class CoupunsModule {}
