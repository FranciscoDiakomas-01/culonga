import { Module } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { AffiliatesController } from './affiliates.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [AffiliatesController],
  providers: [AffiliatesService , DatabaseService],
})
export class AffiliatesModule {}
