import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';

export default class ProductDelleter {
  private readonly logger = new Logger('ProductDeleter');
  private readonly isActive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }
  public async deleteProduct({
    productId,
    userId,
  }: {
    productId: string;
    userId: string;
  }) {
    try {
      const [isActive, User, Product] = await Promise.all([
        this.isActive.isActive(userId),
        this.database.users.findUnique({
          where: {
            id: userId,
          },
        }),
        this.database.products.findUnique({
          where: {
            id: productId,
          },
        }),
      ]);
      if (!isActive || !User) {
        return {
          message: 'A sua conta foi banida',
        };
      }
      if (Product) {
        if (User.role != 'ADMIN' && Product.userId != userId) {
          return {
            message: 'A sua conta foi banida',
          };
        }
        const deletedProduct = await this.database.products.delete({
          where: {
            id: Product.id,
          },
        });
        return {
          message: deletedProduct?.id
            ? 'Produto Eliminado'
            : 'Erro ao eliminar produto',
          deleted: deletedProduct?.id ? true : false,
        };
      } else {
        return {
          message: 'Produto não encontrado',
        };
      }
    } catch (error) {
      this.logger.log(error?.message ?? error?.error);
      return {
        message: 'Erro ao deletar o produto',
      };
    }
  }
  public async deleteOffer({
    offerId,
    userId,
  }: {
    offerId: string;
    userId: string;
  }) {
    try {
      const [isActive, User, Offer] = await Promise.all([
        this.isActive.isActive(userId),
        this.database.users.findUnique({
          where: {
            id: userId,
          },
        }),
        this.database.offer.findUnique({
          where: {
            id: offerId,
          },
        }),
      ]);
      if (!isActive || !User) {
        return {
          message: 'A sua conta foi banida',
        };
      }
      this.logger.log(Offer);
      if (Offer) {
        if (User.role != 'ADMIN' && Offer.userid != userId) {
          return {
            message: 'A sua conta foi banida',
          };
        }
        const deletedOffer = await this.database.offer.delete({
          where: {
            id: Offer.id,
          },
        });
        return {
          message: deletedOffer?.id
            ? 'oferta Eliminado'
            : 'Erro ao eliminar oferta',
          deleted: deletedOffer?.id ? true : false,
        };
      } else {
        return {
          message: 'oferta não encontrado',
        };
      }
    } catch (error) {
      this.logger.log(error);
      return {
        message: 'Oferta não econtrada',
      };
    }
  }
}
