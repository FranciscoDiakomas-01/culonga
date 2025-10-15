import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';

export default class IntegrationGetter {
  private readonly logger = new Logger('Integration');
  private readonly isActive: IsActiveUser;

  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }

  public async getter(userId: string) {
    try {
      const isACtive = await this.isActive.isActive(userId);
      if (isACtive) {
        const myIntegratins = await this.database.integration.findMany({
          where: {
            userid: userId,
          },
          select: {
            createdAt: true,
            updatedAt: true,
            platform: true,
            status: true,
            id: true,
            url: true,
          },

          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          data: myIntegratins,
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
