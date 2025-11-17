import DatabaseService from 'src/services/database/database.service';
import { Logger } from '@nestjs/common';
import limit from 'src/constants/limit';
import { Status } from 'generated/prisma';

import { startOfMonth, endOfMonth } from 'date-fns';
export default class UserGetter {
  private readonly logger: Logger = new Logger('UserGetter');
  constructor(private readonly database: DatabaseService) {}
  public async getAllUsers(page: number) {
    try {
      const [Users, totalusers, actives, desactives, editing] =
        await Promise.all([
          this.database.users.findMany({
            select: {
              name: true,
              status: true,
              email: true,
              lastname: true,
              profile: true,
              id: true,
              telefone: true,
              createdAt: true,
              availableBalance: true,
              role: true,
              totalEarned: true,
            },
            take: limit,
            where: {
              role: 'SELLER',
            },
            skip: (page - 1) * limit,
          }),
          this.database.users.count({
            where: {
              role: 'SELLER',
            },
          }),
          this.database.users.count({
            where: {
              status: 'APROVED',
              role: 'SELLER',
            },
          }),
          this.database.users.count({
            where: {
              OR: [
                {
                  status: 'CANCELED',
                },
                {
                  status: 'REJECTED',
                },
                {
                  status: 'BANED',
                },
              ],
              role: 'SELLER',
            },
          }),
          this.database.users.count({
            where: {
              role: 'SELLER',
              status: {
                in: ['CREATED', 'PENDING'],
              },
            },
          }),
        ]);
      const lastPage = totalusers == 0 ? 0 : Math.ceil(totalusers / limit);
      return {
        data: Users,
        total: totalusers,
        page,
        lastpage: lastPage,
        limit,
        stats: [
          {
            value: totalusers,
            label: 'Total usuários',
            isCoin: false,
            description: 'total de pessoas registradas na nubla',
          },

          {
            value: actives,
            label: 'Usuários Aprovados',
            isCoin: false,
            description: 'total de Usuários aprovados pela Culonga',
          },
          {
            value: desactives,
            label: 'Usuários Reprovados',
            isCoin: false,
            description: 'total de Usuários reprovados pela Culonga',
          },
          {
            value: editing,
            label: 'Usuários em Rascunho',
            isCoin: false,
            description: 'total de Usuários que ainda não foram verificados',
          },
        ],
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar usuários');
      return {
        error: 'Erro ao buscar usuários',
      };
    }
  }
  public async getUserById(uuid: string) {
    try {
      const [sum, User] = await Promise.all([
        this.database.payment.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: 'APROVED',
          },
        }),
        this.database.users.findUnique({
          where: {
            id: uuid,
          },
          select: {
            name: true,
            status: true,
            email: true,
            lastname: true,
            profile: true,
            id: true,
            telefone: true,
            createdAt: true,
            availableBalance: true,
            role: true,
            totalEarned: true,
            totalAfiliations: true,
            totalTranfered: true,
            totatReciev: true,
          },
        }),
      ]);

      // Garante que seja number, nunca null
      const totalSum = sum._sum.amount ?? 0;

      if (User && User.role === 'ADMIN') {
        User.availableBalance = totalSum;
        User.totalEarned = totalSum;
      } else if (User) {
        User.availableBalance = User.availableBalance ?? 0;
        User.totalEarned = User.totalEarned ?? 0;
      }

      return {
        data: User,
        message: User ?? 'Usuário não encontrado',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar usuários');
      return {
        message: 'Erro ao buscar usuários',
      };
    }
  }

  public async getUserRanking() {
  try {
    const inicioMes = startOfMonth(new Date());
    const fimMes = endOfMonth(new Date());

    const ranking = await this.database.payment.groupBy({
      by: ['userid'],
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: inicioMes,
          lte: fimMes,
        },
        status: 'APROVED',
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 9,
    });

    const validUserIds = ranking
      .map((r) => r.userid)
      .filter((id): id is string => id !== null);

    const [users] = await Promise.all([
      this.database.users.findMany({
        where: {
          id: { in: validUserIds }
        },
        select: {
          id: true,
          name: true,
          lastname: true,
          profile: true,
        },
      }),
    ]);

    const result = ranking
      .map((r) => {
        const user = users.find((u) => u.id === r.userid);
        return {
          name: user?.name,
          lastname: user?.lastname,
          profile: user?.profile,
          totalEarned: r._sum.amount ?? 0,
        };
      }).filter((u) => u && u.totalEarned > 0);

    const sortedResult = result.sort((a, b) => b.totalEarned - a.totalEarned);
    return { data: sortedResult };
  } catch (error) {
    console.error('Erro no getUserRanking:', error);
    this.logger.error(`Erro ao buscar ranking: ${error.message}`);
    return { data: [] };
  }
}

  public async getAllUsersByStatus(page: number, status: Status) {
    try {
      const [Users, totalusers] = await Promise.all([
        this.database.users.findMany({
          select: {
            name: true,
            status: true,
            email: true,
            lastname: true,
            profile: true,
            id: true,
            telefone: true,
            createdAt: true,
            availableBalance: true,
            role: true,
            totalEarned: true,
          },

          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          where: {
            role: 'SELLER',
            status,
          },
          skip: (page - 1) * limit,
        }),
        this.database.users.count({
          where: {
            role: 'SELLER',
            status,
          },
        }),
      ]);
      const lastPage = totalusers == 0 ? 0 : Math.ceil(totalusers / limit);
      return {
        data: Users,
        total: totalusers,
        page,
        lastpage: lastPage,
        limit,
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar usuários');
      return {
        error: 'Erro ao buscar usuários',
      };
    }
  }
}
