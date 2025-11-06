import { Logger } from '@nestjs/common';
import limit from 'src/constants/limit';

import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { Status } from 'generated/prisma';

export default class PaymentGetter {
  private readonly logger = new Logger('Payment');
  private readonly isActive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }
  public async getPayments(userid: string | undefined, page: number) {
    try {
      if (userid) {
        const isAvtive = await this.isActive.isActive(userid);
        if (isAvtive) {
          const [myPaymenst, totalPayments] = await Promise.all([
            this.database.payment.findMany({
              take: limit,
              skip: (page - 1) * limit,
              where: {
                userid,
              },
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                amount: true,
                method: true,
                createdAt: true,
                status: true,
                uuid: true,
                products: true,
                user: true,
                updatedAt: true,
                product: true,
                coupun: true,
              },
            }),
            this.database.payment.count({
              where: {
                userid,
              },
            }),
          ]);
          return {
            data: myPaymenst,
            total: totalPayments,
            limit,
            page,
            lastpage: totalPayments == 0 ? 0 : Math.ceil(totalPayments / limit),
          };
        }
        return {
          message: 'Sua conta foi banida',
        };
      }
      const [myPaymenst, totalPayments] = await Promise.all([
        this.database.payment.findMany({
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.database.payment.count({}),
      ]);
      return {
        data: myPaymenst,
        total: totalPayments,
        limit,
        page,
        lastpage: totalPayments == 0 ? 0 : Math.ceil(totalPayments / limit),
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? 'Erro ao listar os pagamentos',
      );
      return {
        message: 'Erro ao buscar os pagamentos',
      };
    }
  }
  public async getPaymentsStats(userid: string | undefined) {
    try {
      const hoje = new Date();
      const ontem = subDays(hoje, 1);

      if (userid) {
        const isAvtive = await this.isActive.isActive(userid);
        if (isAvtive) {
          const [result, sellsPerProducts] = await Promise.all([
            this.database.payment.groupBy({
              by: ['createdAt'],
              _sum: {
                amount: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
              where: {
                userid,
                status: 'APROVED',
              },
            }),
            this.database.payment.groupBy({
              by: ['productId'],
              _sum: {
                amount: true,
              },
              where: {
                userid,
                status: 'APROVED',
              },
            }),
          ]);
          const productIds = sellsPerProducts.map((p) => p.productId);
          const products = await this.database.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true },
          });
          const resultSellPerProduct = sellsPerProducts.map((p) => {
            const product = products.find((prod) => prod.id === p.productId);
            return {
              name:
                product?.title ?? `Produto Eliminado ${crypto.randomUUID()}`,
              total: p._sum.amount,
            };
          });
          const formatted = result.map((item) => ({
            date: item.createdAt,
            total: item._sum.amount ?? 0,
          }));

          const [
            totalHoje,
            totalOntem,
            totalMes,
            totalAno,
            countHoje,
            countOntem,
            countMes,
            countAno,
          ] = await Promise.all([
            // apenas aprovados (soma)
            this.database.payment.aggregate({
              _sum: { amount: true },
              where: {
                createdAt: { gte: startOfDay(hoje), lte: endOfDay(hoje) },
                userid,
                status: 'APROVED',
              },
            }),
            this.database.payment.aggregate({
              _sum: { amount: true },
              where: {
                createdAt: { gte: startOfDay(ontem), lte: endOfDay(ontem) },
                userid,
                status: 'APROVED',
              },
            }),
            this.database.payment.aggregate({
              _sum: { amount: true },
              where: {
                createdAt: { gte: startOfMonth(hoje), lte: endOfMonth(hoje) },
                userid,
                status: 'APROVED',
              },
            }),
            this.database.payment.aggregate({
              _sum: { amount: true },
              where: {
                createdAt: { gte: startOfYear(hoje), lte: endOfYear(hoje) },
                userid,
                status: 'APROVED',
              },
            }),

            // ✅ todos registros (count)
            this.database.payment.count({
              where: {
                createdAt: { gte: startOfDay(hoje), lte: endOfDay(hoje) },
                userid,

                status: 'APROVED',
              },
            }),
            this.database.payment.count({
              where: {
                createdAt: { gte: startOfDay(ontem), lte: endOfDay(ontem) },
                userid,

                status: 'APROVED',
              },
            }),
            this.database.payment.count({
              where: {
                createdAt: { gte: startOfMonth(hoje), lte: endOfMonth(hoje) },
                userid,

                status: 'APROVED',
              },
            }),
            this.database.payment.count({
              where: {
                createdAt: { gte: startOfYear(hoje), lte: endOfYear(hoje) },
                userid,

                status: 'APROVED',
              },
            }),
          ]);

          return {
            data: formatted,
            stats: [
              {
                title: 'Vendas realizadas hoje',
                value: totalHoje._sum.amount || 0, // soma só aprovados
                total: countHoje || 0, // quantidade total de pagamentos
                label: 'Hoje',
              },
              {
                title: 'Vendas realizadas ontem',
                value: totalOntem._sum.amount || 0,
                total: countOntem || 0,
                label: 'Ontem',
              },
              {
                title: 'Vendas realizadas no mês',
                value: totalMes._sum.amount || 0,
                total: countMes || 0,
                label: 'Mês',
              },
              {
                title: 'Vendas realizadas no ano',
                value: totalAno._sum.amount || 0,
                total: countAno || 0,
                label: 'Ano',
              },
            ],
            sells: resultSellPerProduct,
          };
        }
        return { message: 'Sua conta foi banida' };
      }
      const [result, sellsPerProducts] = await Promise.all([
        this.database.payment.groupBy({
          by: ['createdAt'],
          _sum: {
            amount: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            status: 'APROVED',
          },
        }),
        this.database.payment.groupBy({
          by: ['productId'],
          _sum: {
            amount: true,
          },
          where: {
            status: 'APROVED',
          },
        }),
      ]);
      const productIds = sellsPerProducts.map((p) => p.productId);
      const products = await this.database.products.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      });
      const resultSellPerProduct = sellsPerProducts.map((p) => {
        const product = products.find((prod) => prod.id === p.productId);
        return {
          name: product?.title ?? `Produto Eliminado ${crypto.randomUUID()}`,
          total: p._sum.amount,
        };
      });
      const formatted = result.map((item) => ({
        date: item.createdAt,
        total: item._sum.amount ?? 0,
      }));

      const [
        totalHoje,
        totalOntem,
        totalMes,
        totalAno,
        countHoje,
        countOntem,
        countMes,
        countAno,
      ] = await Promise.all([
        // apenas aprovados (soma)
        this.database.payment.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: startOfDay(hoje), lte: endOfDay(hoje) },

            status: 'APROVED',
          },
        }),
        this.database.payment.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: startOfDay(ontem), lte: endOfDay(ontem) },

            status: 'APROVED',
          },
        }),
        this.database.payment.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: startOfMonth(hoje), lte: endOfMonth(hoje) },

            status: 'APROVED',
          },
        }),
        this.database.payment.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: startOfYear(hoje), lte: endOfYear(hoje) },

            status: 'APROVED',
          },
        }),
        this.database.payment.count({
          where: {
            createdAt: { gte: startOfDay(hoje), lte: endOfDay(hoje) },

            status: 'APROVED',
          },
        }),
        this.database.payment.count({
          where: {
            createdAt: { gte: startOfDay(ontem), lte: endOfDay(ontem) },

            status: 'APROVED',
          },
        }),
        this.database.payment.count({
          where: {
            createdAt: { gte: startOfMonth(hoje), lte: endOfMonth(hoje) },

            status: 'APROVED',
          },
        }),
        this.database.payment.count({
          where: {
            createdAt: { gte: startOfYear(hoje), lte: endOfYear(hoje) },

            status: 'APROVED',
          },
        }),
      ]);

      return {
        data: formatted,
        stats: [
          {
            title: 'Vendas realizadas hoje',
            value: totalHoje._sum.amount || 0, // soma só aprovados
            total: countHoje || 0, // quantidade total de pagamentos
            label: 'Hoje',
          },
          {
            title: 'Vendas realizadas ontem',
            value: totalOntem._sum.amount || 0,
            total: countOntem || 0,
            label: 'Ontem',
          },
          {
            title: 'Vendas realizadas no mês',
            value: totalMes._sum.amount || 0,
            total: countMes || 0,
            label: 'Mês',
          },
          {
            title: 'Vendas realizadas no ano',
            value: totalAno._sum.amount || 0,
            total: countAno || 0,
            label: 'Ano',
          },
        ],
        sells: resultSellPerProduct,
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? 'Erro ao listar os pagamentos',
      );
      return { message: 'Erro ao buscar os pagamentos' };
    }
  }
  public async getPaymentStatus(paymentid: string) {
    try {
      const [data] = await Promise.all([
        this.database.payment.findFirst({
          where: {
            uuid: paymentid,
          },
        }),
      ]);
      return {
        ...data,
        canMark: true,
      };
    } catch (error) {
      this.logger.log(error);
      return {
        status: 'Não encontrado',
      };
    }
  }
  public async getPaymentsByStatus(
    userid: string | undefined,
    page: number,
    status: Status,
  ) {
    try {
      if (userid) {
        const isAvtive = await this.isActive.isActive(userid);
        if (isAvtive) {
          const [myPaymenst, totalPayments] = await Promise.all([
            this.database.payment.findMany({
              take: limit,
              skip: (page - 1) * limit,
              where: {
                userid,
                status,
              },
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                amount: true,
                method: true,
                createdAt: true,
                status: true,
                uuid: true,
                products: true,
                user: true,
                updatedAt: true,
              },
            }),
            this.database.payment.count({
              where: {
                userid,
                status,
              },
            }),
          ]);
          return {
            data: myPaymenst,
            total: totalPayments,
            limit,
            page,
            lastpage: totalPayments == 0 ? 0 : Math.ceil(totalPayments / limit),
          };
        }
        return {
          message: 'Sua conta foi banida',
        };
      }
      const [myPaymenst, totalPayments] = await Promise.all([
        this.database.payment.findMany({
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            status,
          },
        }),
        this.database.payment.count({
          where: {
            status,
          },
        }),
      ]);
      return {
        data: myPaymenst,
        total: totalPayments,
        limit,
        page,
        lastpage: totalPayments == 0 ? 0 : Math.ceil(totalPayments / limit),
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? 'Erro ao listar os pagamentos',
      );
      return {
        message: 'Erro ao buscar os pagamentos',
      };
    }
  }

  public async getMyPaymentPerInterval(
    from: string,
    to: string,
    userid: string,
  ) {
    try {
      const date1 = new Date(from);
      const dat2 = new Date(to);
      const user = await this.database.users.findFirst({
        where: {
          id: userid,
        },
      });
      if (!user) {
        return {
          message: 'Perfil não encontrado',
        };
      }
      const totalPayments = await this.database.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'APROVED',
          userid: userid,
          createdAt: {
            gte: date1,
            lte: dat2,
          },
        },
        _count: true,
      });
      return {
        total: totalPayments?._sum?.amount,
        sales: totalPayments._count,
      };
    } catch (error) {
      return {
        message: 'Data inválida',
      };
    }
  }
}
