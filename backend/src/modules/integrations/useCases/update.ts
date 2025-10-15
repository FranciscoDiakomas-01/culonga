import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';
import { CreateIntegrationDto } from '../dto/create-integration.dto';

export default class IntegrationUpdater {
  private readonly logger = new Logger('Integration');
  private readonly isActive: IsActiveUser;

  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }

  public async update(data: CreateIntegrationDto, id: string) {
    try {
      const isACtive = await this.isActive.isActive(data.userid);
      if (isACtive) {
        const updated = await this.database.integration.update({
          data: {
            ...data,
          },
          where: {
            userid: data.userid,
            id,
          },
        });
        return {
          message: updated?.id ? 'Actualizado com sucesso' : 'Erro ao Actualizar',
          updated: updated?.id ? true : false,
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
