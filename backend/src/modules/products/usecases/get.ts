import { Logger } from '@nestjs/common';
import { Status } from 'generated/prisma';
import limit from 'src/constants/limit';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';

export default class ProductGetter {
  private readonly isActive: IsActiveUser;
  private readonly logger = new Logger('ProductgGetter');
  private readonly productSelect = {
    id: true,
    orderbumps: true,
    backredirect: true,
    category: true,
    createdAt: true,
    updatedAt: true,
    price: true,
    description: true,
    garant: true,
    type: true,
    title: true,
    status: true,
    userId: true,
    upsell: true,
    whatsappSuport: true,
    productid: true,
    link: true,
    payment: true,
    cover: true,
    pixelId: true,
    banner: true,
  };
  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }
  public async getProductById(id: string) {
    try {
      const [product, offer] = await Promise.all([
        this.database.products.findUnique({
          where: {
            id,
            status: {
              notIn: ['BANED', 'CANCELED', 'REJECTED'],
            },
          },
          select: {
            ...this.productSelect,
            percentShare: true,
          },
        }) as any,
        this.database.offer.findUnique({
          where: {
            id: id,
          },
          select: {
            product: {
              select: {
                ...this.productSelect,
                percentShare: true,
              },
            },
            price: true,
            link: true,
            updatedAt: true,
            createdAt: true,
            productId: true,
            id: true,
          },
        }),
      ]);
      let OrderBumps: any[] = [];
      let checkout: any = {};
      let disponibleOrderBumps: any[] = [];
      if (product) {
        [OrderBumps, checkout, disponibleOrderBumps] = await Promise.all([
          await this.database.products.findMany({
            select: {
              title: true,
              price: true,
              cover: true,
              description: true,
              id: true,
            },
            where: {
              id: {
                in: product?.orderbumps,
              },
            },
          }),
          await this.database.productCheckout.findUnique({
            where: {
              productId: product.id,
            },
          }),
          await this.database.products.findMany({
            where: {
              AND: [
                {
                  userId: product?.userId,
                },
                {
                  id: {
                    not: product?.id,
                    notIn: product.orderbumps,
                  },
                },
                {
                  status: 'APROVED',
                },
              ],
            },
            select: {
              title: true,
              id: true,
            },
          }),
        ]);
      } else if (offer) {
        const motherIsBanner = await this.database.products.findFirst({
          where: {
            id: offer.productId,
            status: {
              notIn: ['BANED', 'CANCELED', 'REJECTED'],
            },
          },
        });
        if (motherIsBanner) {
          [OrderBumps, checkout] = await Promise.all([
            await this.database.products.findMany({
              select: {
                title: true,
                price: true,
                cover: true,
                description: true,
                id: true,
              },
              where: {
                id: {
                  in: offer?.product.orderbumps,
                },
              },
            }),
            await this.database.productCheckout.findUnique({
              where: {
                productId: offer.product.id,
              },
            }),
          ]);
        } else {
          return {
            message: 'Produto não encontrado ou foi banido',
          };
        }
      }
      if (!product && !offer) {
        return {
          message: 'Produto não encontrado ou foi banido',
        };
      }
      product.percent = product?.percentShare;
      return {
        product: product ?? {
          banner: offer?.product.banner,
          cover: offer?.product.cover,
          createdAt: offer?.createdAt,
          id: offer?.id,
          link: offer?.link,
          orderbumps: offer?.product?.orderbumps,
          payment: offer?.product?.payment,
          price: offer?.price,
          productId: offer?.id,
          title: offer?.product?.title,
          updatedAt: offer?.updatedAt,
          userId: offer?.product?.userId,
          upsell: offer?.product?.upsell,
          percent: offer?.product.percentShare,
        },
        orderbumps: OrderBumps,
        type: product ? 'Product' : 'Offer',
        checkout: {
          ...checkout,
          timer: JSON.parse(checkout?.timer),
          btn: JSON.parse(checkout?.btn),
          orderbump: JSON.parse(checkout?.orderbump),
        },
        disponibleOrderBumps,
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar o produto');
      return {
        message: 'Produto não encontrado',
      };
    }
  }
  public async getProductbyUser(userid: string, page: number) {
    try {
      const isACtive = await this.isActive.isActive(userid);
      if (isACtive) {
        const [products, totalproduct] = await Promise.all([
          this.database.products.findMany({
            select: {
              productid: true,
              id: true,
              title: true,
              cover: true,
              status: true,
              link: true,
              price: true,
              createdAt: true,
              type: true,
              category: true,
              totalPurchase: true,
            },
            where: {
              userId: userid,
            },
            orderBy: [{ createdAt: 'desc' }, { totalPurchase: 'desc' }],
          }),
          this.database.products.count({
            where: {
              userId: userid,
            },
          }),
        ]);
        const lastPage = Math.ceil(totalproduct / limit);
        return {
          products,
          page,
          lastPage,
          total: totalproduct,
          limit,
          message: 'Lista dos meus produtos',
        };
      } else {
        return {
          message: 'Sua conta está banida',
        };
      }
    } catch (error) {
      this.logger.log(error?.message);
      return {
        message: 'Sem produto',
      };
    }
  }
  public async getAllProducts(page: number) {
    const [products, totalproduct] = await Promise.all([
      this.database.products.findMany({
        select: {
          productid: true,
          id: true,
          title: true,
          cover: true,
          status: true,
          link: true,
          price: true,
          createdAt: true,
          type: true,
          category: true,
          totalPurchase: true,
          user: {
            select: {
              name: true,
              lastname: true,
              profile: true,
            },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: [{ createdAt: 'desc' }, { totalPurchase: 'desc' }],
      }),
      this.database.products.count({}),
    ]);
    const lastPage = Math.ceil(totalproduct / limit);
    return {
      products,
      page,
      lastPage,
      total: totalproduct,
      limit,
      message: 'Lista dos produtos',
    };
  }
  public async getAllProductsByStatus(
    page: number,
    userid: undefined | string,
  ) {
    if (userid) {
      const is = await new IsActiveUser(this.database).isActive(userid);
      if (!is) {
        return {
          message: 'Sua conta foi banida',
        };
      }
      const [products, totalproduct] = await Promise.all([
        this.database.products.findMany({
          select: {
            productid: true,
            id: true,
            title: true,
            cover: true,
            status: true,
            link: true,
            price: true,
            createdAt: true,
            type: true,
            category: true,
            totalPurchase: true,
            user: {
              select: {
                name: true,
                lastname: true,
                profile: true,
              },
            },
          },
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            userId: userid,
          },
        }),
        this.database.products.count({
          where: {
            userId: userid,
          },
        }),
      ]);
      const lastPage = Math.ceil(totalproduct / limit);
      return {
        products,
        page,
        lastPage,
        total: totalproduct,
        limit,
        message: 'Lista dos produtos',
      };
    }
    const [products, totalproduct] = await Promise.all([
      this.database.products.findMany({
        select: {
          productid: true,
          id: true,
          title: true,
          cover: true,
          status: true,
          link: true,
          price: true,
          createdAt: true,
          type: true,
          category: true,
          totalPurchase: true,
          user: {
            select: {
              name: true,
              lastname: true,
              profile: true,
            },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.database.products.count({}),
    ]);
    const lastPage = Math.ceil(totalproduct / limit);
    return {
      products,
      page,
      lastPage,
      total: totalproduct,
      limit,
      message: 'Lista dos produtos',
    };
  }
  public async asynGetProductStats(role: string, userid: string = '') {
    try {
      if (role?.toUpperCase() == 'ADMIN') {
        const [total, rejected, pending, aproved] = await Promise.all([
          this.database.products.count(),
          this.database.products.count({
            where: {
              status: 'REJECTED',
            },
          }),
          this.database.products.count({
            where: {
              status: 'PENDING',
            },
          }),
          this.database.products.count({
            where: {
              status: 'APROVED',
            },
          }),
        ]);
        return [
          {
            value: total,
            label: 'Total de produtos',
            isCoin: false,
            description: 'Total de produtos criados',
          },

          {
            value: aproved,
            label: 'Produtos Aprovados',
            isCoin: false,
            description: 'Total de produtos aprovados',
          },
          {
            value: rejected,
            label: 'Produtos Reprovados',
            isCoin: false,
            description: 'Total de produtos reprovados',
          },
          {
            value: pending,
            label: 'Produtos não finalizado',
            isCoin: false,
            description: 'Total de produtos não finalizados',
          },
        ];
      } else {
        const isAcive = await this.isActive.isActive(userid);
        if (!isAcive) {
          return {
            message: 'Sua conta foi banida',
          };
        }
        const [total, rejected, pending, aproved] = await Promise.all([
          this.database.products.count({
            where: {
              userId: userid,
            },
          }),
          this.database.products.count({
            where: {
              status: 'REJECTED',
              userId: userid,
            },
          }),
          this.database.products.count({
            where: {
              status: 'PENDING',
              userId: userid,
            },
          }),
          this.database.products.count({
            where: {
              status: 'APROVED',
              userId: userid,
            },
          }),
        ]);
        return [
          {
            value: total,
            label: 'Meus Produtos',
            isCoin: false,
            description: 'Total de produtos criados',
          },

          {
            value: aproved,
            label: 'Produtos Aprovados',
            isCoin: false,
            description: 'Total de produtos aprovados',
          },
          {
            value: rejected,
            label: 'Produtos Reprovados',
            isCoin: false,
            description: 'Total de produtos reprovados',
          },
          {
            value: pending,
            label: 'Produtos não finalizado',
            isCoin: false,
            description: 'Total de produtos foram finalizados',
          },
        ];
      }
    } catch (error) {
      this.logger.log(error?.message);
      return {
        message: 'Sem prodto',
      };
    }
  }
  public async getProductOffeer(productid: string) {
    try {
      this.logger.log(productid, ' ID do produto');
      if (!productid) {
        return {
          data: [],
        };
      }
      const Offers = await this.database.offer.findMany({
        where: {
          productId: String(productid),
        },
        select: {
          link: true,
          id: true,
          title: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          productId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        data: Offers,
      };
    } catch (error) {
      this.logger.log(error?.message);
      return {
        message: 'Sem prodto',
      };
    }
  }
  public async getSpeficStats() {}
}
