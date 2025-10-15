import DatabaseService from 'src/services/database/database.service';
import { Logger } from '@nestjs/common';
export default class UserDeleter {
  
    private readonly logger: Logger = new Logger("UserDelleter")
  constructor(
    private readonly database: DatabaseService,
  ) {}
  public async deleteAllUsers() {
    try {
      const users = await this.database.users.deleteMany();
      return {
        message: `${users.count} foram deliminados`,
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao Eliminar usuários');
      return {
        message: 'Erro ao Eliminar usuários',
      };
    }
  }
  public async deleteById(uuid: string) {
    try {
      const User = await this.database.users.delete({
        where: {
          id: uuid,
        },
      });
      return {
        data: User,
        message: User ?? 'Usuário não encontrado',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao deletar');
      return {
        error: 'Erro ao deletar',
        message: 'Usuário não encontrado',
      };
    }
  }
}
