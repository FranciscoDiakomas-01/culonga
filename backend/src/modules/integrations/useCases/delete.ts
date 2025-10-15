import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';

export default class IntegrationDeleter {
  private readonly logger = new Logger('Integration');
  private readonly isActive: IsActiveUser;

  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }

  public async deleter(userId: string, integrationId: string) {
    try {
      const isACtive = await this.isActive.isActive(userId);
      if (isACtive) {
        const myIntegratins = await this.database.integration.delete({
          where: {
            userid: userId,
            id: integrationId,
          },
          select: {
            createdAt: true,
            updatedAt: true,
            platform: true,
            status: true,
            id: true,
            url: true,
          },
        });

        return {
          message: myIntegratins?.id
            ? 'Integração eliminada'
            : 'Essa integração não te pertence',
          deleted: myIntegratins?.id ? true : false,
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
