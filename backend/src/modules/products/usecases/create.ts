import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { CreateOffer, CreateProductDto } from '../dto/create-product.dto';
import defaultCheckout from 'src/constants/default.checkout';
import IsActiveUser from 'src/interceptors/isActiveUser';

export default class ProductSetter {
  private readonly logger = new Logger('ProductSetter');
  private readonly isActiveUser: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isActiveUser = new IsActiveUser(this.database);
  }
  public async create(data: CreateProductDto) {
    try {
      const uuid = crypto.randomUUID();
      const isAcive = await this.isActiveUser.isActive(data.userId);
      const [user, isAProduct] = await Promise.all([
        this.database.users.findFirst({
          where: {
            id: data.userId,
          },
        }),
        this.database.products.findFirst({
          where: {
            title: {
              mode: 'insensitive',
              equals: data.title,
            },
          },
        }),
      ]);

      if (isAProduct) {
        return {
          message: 'Produto existente , tente outro nome',
        };
      }
      if (!isAcive || !user) {
        return {
          message: 'A sua conta esta suspensa',
        };
      }

      const createdProduct = await this.database.products.create({
        data: {
          id: uuid,
          category: '',
          title: data.title,
          description: data.description,
          type: data.type,
          price: data.price,
          link: `${process.env.CHEKOUTLINK}${uuid}`,
          backredirect: '',
          garant: 7,
          userId: data.userId,
          payment: [1, 2, 33],
          orderbumps: [],
          upsell: '',
          status: 'PENDING',
          whatsappSuport: '',
          totalAfiliationsPurchase: 0,
          totalAfiliations: 0,
          totalPurchase: 0,
        },
      });
      const [checkout] = await Promise.all([
        this.database.productCheckout.create({
          data: {
            btn: JSON.stringify(defaultCheckout.btn),
            bg: defaultCheckout.bg,
            textColor: defaultCheckout.textColor,
            orderbump: JSON.stringify(defaultCheckout.orderbump),
            productId: createdProduct.id,
            timer: JSON.stringify(defaultCheckout.timer),
          },
        }),
      ]);
      return {
        created: true,
        message: 'Produto criado',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao criar o produto');
      return {
        message: 'Erro ao criar o produto',
      };
    }
  }
  public async createOffer(data: CreateOffer) {
    try {
      const isAcive = await this.isActiveUser.isActive(data.userId);
      if (!isAcive) {
        return {
          message: 'A sua conta esta suspensa',
        };
      }
      const id = crypto.randomUUID();
      const Offer = await this.database.offer.create({
        data: {
          userid: data.userId,
          id,
          title: data.title,
          price: data.price,
          productId: data.productId,
          link: process.env.CHEKOUTLINK + id,
        },
      });
      if (Offer) {
        return {
          created: true,
          message: 'Oferta criada',
        };
      }
      return {
        message: 'Erro ao criar o Oferta',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao criar o oferta');
      return {
        message: 'Erro ao criar o oferta',
      };
    }
  }
}
