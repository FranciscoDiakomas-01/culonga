import { Logger } from '@nestjs/common';
import limit from 'src/constants/limit';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';

export default class TransiActionGetter {
  private isActive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }
  private readonly logger = new Logger('Transiactio');

  public async getTrasactions(userid: string | undefined, page: number = 1) {
    try {
      if (userid) {
        const isActive = await this.isActive.isActive(userid);
        if (!isActive) {
          return {
            messge: 'Sua conta foi banida',
          };
        }
        const [myTransiction, totalTransictions] = await Promise.all([
          await this.database.withdrawal.findMany({
            take: limit,
            skip: (page - 1) * limit,
            select: {
              bank: true,
              status: true,
              updatedAt: true,
              iban: true,
              createdAt: true,
              amount: true,
              fileURL: true,
              id: true,
            },
            where: {
              userid,
            },

            orderBy: {
              createdAt: 'desc',
            },
          }),
          await this.database.withdrawal.count({
            where: {
              userid,
            },
          }),
        ]);
        const lastPage = Math.ceil(totalTransictions / limit);
        return {
          data: myTransiction,
          lastPage,
          page,
          limit,
        };
      }
      const [myTransiction, totalTransictions] = await Promise.all([
        await this.database.withdrawal.findMany({
          take: limit,
          skip: (page - 1) * limit,
          select: {
            bank: true,
            status: true,
            updatedAt: true,
            iban: true,
            amount: true,
            createdAt: true,
            fileURL: true,
            id: true,
            user: {
              select: {
                name: true,
                lastname: true,
                email: true,
                profile: true,
                id: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        }),
        await this.database.withdrawal.count(),
      ]);
      const lastPage = Math.ceil(totalTransictions / limit);
      return {
        data: myTransiction,
        lastPage,
        page,
        limit,
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar o saque');
      return {
        message: 'Produto não encontrado',
      };
    }
  }
  public async getTranisactionStats(userid: string | undefined) {
    try {
      if (userid) {
        return await this.getWithdrawalsSummaryByUser(userid);
      }
      return await this.getWithdrawalsSummary();
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar o produto');
      return {
        message: 'saque não encontrado',
      };
    }
  }

  private async getWithdrawalsSummaryByUser(userid: string) {
    const [grouped, User] = await Promise.all([
      this.database.withdrawal.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { _all: true },
        where: { userid },
      }),
      this.database.users.findUnique({
        where: { id: userid },
      }),
    ]);
    const statuses = ['PENDING', 'APROVED', 'REJECTED'];

    const alerts = statuses.map((status) => {
      const g = grouped.find((x) => x.status === status);

      let color = 'text-gray-500';
      let title = '';
      let alert = '';

      switch (status) {
        case 'PENDING':
          color = 'text-yellow-500';
          title = 'Saques pendentes';
          alert = `Valor de saques que estão aguardando aprovação`;
          break;
        case 'APROVED':
          color = 'text-green-500';
          title = 'Saques aprovados';
          alert = `Valor de saques já disponíveis para retirada`;
          break;
        case 'REJECTED':
          color = 'text-red-500';
          title = 'Saques rejeitados';
          alert = `Solicitações de saque rejeitadas`;
          break;
      }

      return {
        alert,
        color,
        title,
        value: g?._sum.amount ?? 0,
        requests: g?._count._all ?? 0,
      };
    });
    return [
      {
        alert: 'Valor feito na plataforma',
        color: 'text-blue-500',
        title: 'Saldo feito',
        value: User?.totalEarned,
        requests: '',
      },
      {
        alert: 'Valor disponível para saque',
        color: 'text-indigo-500',
        title: 'Saldo total',
        value: User?.availableBalance,
        requests: '',
      },

      ...alerts,
    ];
  }
  private async getWithdrawalsSummary() {
    const [grouped, total, saque] = await Promise.all([
      this.database.withdrawal.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.database.users.aggregate({
        _sum: {
          totalEarned: true,
        },
      }),
      this.database.users.aggregate({
        _sum: {
          availableBalance: true,
        },
      }),
    ]);
    const statuses = ['PENDING', 'APROVED', 'REJECTED'];

    const alerts = statuses.map((status) => {
      const g = grouped.find((x) => x.status === status);

      let color = 'text-gray-500';
      let title = '';
      let alert = '';

      switch (status) {
        case 'PENDING':
          color = 'text-amber-500';
          title = 'Saques pendentes';
          alert = `Valor de saques que estão aguardando aprovação`;
          break;
        case 'APROVED':
          color = 'text-green-500';
          title = 'Saques aprovados';
          alert = `Valor de saques já disponíveis para retirada`;
          break;
        case 'REJECTED':
          color = 'text-red-500';
          title = 'Saques rejeitados';
          alert = `Solicitações de saque rejeitadas`;
          break;
      }

      return {
        alert,
        color,
        title,
        value: g?._sum.amount ?? 0,
        requests: g?._count._all ?? 0,
      };
    });

    return [
      {
        alert: 'Total feito na plataforma',
        color: 'text-green-500',
        title: 'Saldo total',
        value: total._sum.totalEarned ?? 0,
        requests: '',
      },

      ...alerts,
    ];
  }
}
