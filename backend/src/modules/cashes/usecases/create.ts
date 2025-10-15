import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';
import { CreateTransactionDto } from '../dto/create-cash.dto';

export default class TransitionSetter {
  private readonly logger = new Logger('Transictoion');
  private readonly isACtive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isACtive = new IsActiveUser(this.database);
  }
  public async createTransiaction(data: CreateTransactionDto) {
    try {
      const isActiveUser = await this.isACtive.isActive(data.userid);
      if (isActiveUser) {
        const User = await this.database.users.findUnique({
          where: {
            id: data.userid,
          },
        });
        if (!User || User?.status != 'APROVED') {
          return {
            message: 'Conta não não verificada',
          };
        }
        const totalSaques = await this.database.withdrawal.aggregate({
          where: {
            status: 'PENDING',
            userid: User.id,
          },
          _sum: {
            amount: true,
          },
        });

        const soma = totalSaques._sum.amount ?? 0;

        if (User && User.availableBalance >= data.amount + soma) {
          const createdTransiction = await this.database.withdrawal.create({
            data: {
              ...data,
              status: 'PENDING',
            },
          });
          return {
            message: createdTransiction?.id
              ? 'Pedido de saque criado'
              : 'Erro ao criar',
            created: createdTransiction?.id ? true : false,
          };
        }
        return {
          message: `Saldo insuficiente`,
        };
      }
      return {
        message: 'A sua conta deve ser verificada',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar o produto');
      return {
        message: 'Produto não encontrado',
      };
    }
  }
}
