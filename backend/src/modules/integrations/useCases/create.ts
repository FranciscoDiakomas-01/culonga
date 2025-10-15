import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';
import { CreateIntegrationDto } from '../dto/create-integration.dto';

export default class IntegrationCreater {
  private readonly logger = new Logger('Integration');
  private readonly isActive: IsActiveUser;

  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }

  public async create(data: CreateIntegrationDto) {
    try {
      const isACtive = await this.isActive.isActive(data.userid);
      if (isACtive) {
        const created = await this.database.integration.create({
          data: {
            ...data,
          },
        });
        return {
          message: created?.id ? 'Criado com sucesso' : 'Erro ao criar',
          created: created?.id ? true : false,
        };
      }
      return {
        message: 'Você não pode criar integrações',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar o produto');
      return {
        message: 'Produto não encontrado',
      };
    }
  }
}
