import { Injectable } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import DatabaseService from 'src/services/database/database.service';
import IntegrationCreater from './useCases/create';
import IntegrationGetter from './useCases/get';
import IntegrationUpdater from './useCases/update';
import IntegrationDeleter from './useCases/delete';

@Injectable()
export class IntegrationsService {
  constructor(private readonly database: DatabaseService) {}
  public async create(createIntegrationDto: CreateIntegrationDto) {
    const creater = new IntegrationCreater(this.database);
    return await creater.create(createIntegrationDto);
  }

  public async findAll(userid: string) {
    const getter = new IntegrationGetter(this.database);
    return await getter.getter(userid);
  }

  public async update(id: string, updateIntegrationDto: CreateIntegrationDto) {
    const updated = new IntegrationUpdater(this.database);
    return await updated.update(updateIntegrationDto, id);
  }

  public async delete(userid: string, integrationid: string) {
    const delleter = new IntegrationDeleter(this.database);
    return await delleter.deleter(userid, integrationid);
  }
}
