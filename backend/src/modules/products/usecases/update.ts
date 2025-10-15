import { Logger } from '@nestjs/common';
import {
  EditProductChekoutDTO,
  UpdateProductDTO,
  UpdateProductFiles,
  UpdateProductPaymentDTO,
} from '../dto/create-product.dto';
import DatabaseService from 'src/services/database/database.service';
import { Status } from 'generated/prisma';
import IsActiveUser from 'src/interceptors/isActiveUser';
import { isValidFile } from 'src/lib/util';
export default class ProductUpdater {
  private readonly logger = new Logger('ProductUpdater');
  private readonly isActive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }
  public async UpdateProduct(data: UpdateProductDTO, userId: string) {
    try {
      const [User, Product] = await Promise.all([
        this.database.users.findUnique({ where: { id: userId } }),
        this.database.products.findUnique({
          where: {
            id: data.productId,
          },
        }),
      ]);

      if (User && Product && User.id == Product.userId) {
        const updatedProduct = await this.database.products.update({
          where: {
            id: Product.id,
          },
          data: {
            status:
              Product.file && Product.whatsappSuport ? 'APROVED' : 'PENDING',
            backredirect: data.backRedirect,
            upsell: data.UpSell,
            category: data.category,
            type: data.type,
            description: data.description,
            garant: data.garant,
            orderbumps: data.orderBump,
            whatsappSuport: data.whatsapp,
            pixelId: data.pixelId,
            title: data.title,
            price: data.price,
          },
        });
        return {
          message: updatedProduct?.id
            ? 'Produto actualizado com sucesso'
            : 'Erro ao actualizar',
          updated: updatedProduct?.id ? true : false,
        };
      }
      return {
        message: 'Produto não encontrado',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o produto',
      );
      return {
        message: 'Erro ao Editar o produto',
      };
    }
  }
  public async UpdateProductPayments(
    data: UpdateProductPaymentDTO,
    userId: string,
  ) {
    try {
      if (data.payments.length > 3 || data.payments.length == 0) {
        return {
          message: 'Método de pagamento inválido',
        };
      }
      const [User, Product] = await Promise.all([
        this.database.users.findUnique({ where: { id: userId } }),
        this.database.products.findUnique({
          where: {
            id: data.productId,
          },
        }),
      ]);
      if (User && Product && User.id == Product.userId) {
        const updatedProduct = await this.database.products.update({
          where: {
            id: Product.id,
          },
          data: {
            payment: data.payments,
          },
        });
        return {
          message: updatedProduct?.id
            ? 'Produto actualizado com sucesso'
            : 'Erro ao actualizar',
          updated: updatedProduct?.id ? true : false,
        };
      }
      return {
        message: 'Produto não encontrado',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o produto',
      );
      return {
        message:'Erro ao Editar o produto',
      };
    }
  }
  public async UpdatePrductStatus(productid: string, status: Status) {
    try {
      const [updatedProduct] = await Promise.all([
        this.database.products.update({
          where: {
            id: productid,
          },
          data: {
            status,
          },
        }),
      ]);
      return {
        message: updatedProduct?.id
          ? 'Produto actualizado'
          : 'Producto não encontrado',
        updated: updatedProduct?.id ? true : false,
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o produto',
      );
      return {
        message:'Erro ao Editar o produto',
      };
    }
  }
  public async UpdateProductChekout(
    data: EditProductChekoutDTO,
    userid: string,
  ) {
    try {
      const isAvtive = await this.isActive.isActive(userid);
      if (!isAvtive) {
        return {
          message: 'Sua conta foi banida',
        };
      }
      const Product = await this.database.products.findUnique({
        where: { id: data.id, userId: userid },
      });
      if (Product) {
        const updatedChekout = await this.database.productCheckout.update({
          where: {
            productId: Product.id,
          },
          data: {
            bg: data.bg,
            textColor: data.textColor,
            btn: JSON.stringify(data.btn),
            orderbump: JSON.stringify(data.orderbump),
            timer: JSON.stringify(data.timer),
          },
        });
        return {
          message: updatedChekout?.id
            ? 'Checkout actualizado'
            : 'Erro ao actualizar',
          updated: updatedChekout?.id ? true : false,
        };
      }
      return {
        message: 'Producto não encontrado',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o chekout',
      );
      return {
        message:'Erro ao Editar o chekout',
      };
    }
  }
}
