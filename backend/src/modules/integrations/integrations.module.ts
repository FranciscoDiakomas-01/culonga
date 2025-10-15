import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, DatabaseService],
})
export class IntegrationsModule {}
