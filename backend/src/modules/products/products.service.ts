import { Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  CreateOffer,
  EditProductChekoutDTO,
  UpdateProductDTO,
  UpdateProductFiles,
  UpdateProductPaymentDTO,
  canUploadDTO,
} from './dto/create-product.dto';
import DatabaseService from 'src/services/database/database.service';
import ProductGetter from './usecases/get';
import ProductDelleter from './usecases/delete';
import ProductSetter from './usecases/create';
import ProductUpdater from './usecases/update';
import { Status } from 'generated/prisma';
import IsActiveUser from 'src/interceptors/isActiveUser';

@Injectable()
export class ProductsService {
  private readonly productGetter: ProductGetter;
  private readonly delleter: ProductDelleter;
  private readonly creatter: ProductSetter;
  private readonly updater: ProductUpdater;
  constructor(private readonly database: DatabaseService) {
    this.productGetter = new ProductGetter(this.database);
    this.delleter = new ProductDelleter(this.database);
    this.creatter = new ProductSetter(this.database);
    this.updater = new ProductUpdater(this.database);
  }
  // SETTER
  public async createProduct(data: CreateProductDto) {
    const createdProduct = await this.creatter.create(data);
    return createdProduct;
  }
  public async createOffers(data: CreateOffer) {
    const createdProduct = await this.creatter.createOffer(data);
    return createdProduct;
  }
  //UPDATER
  public async update(userid: string, data: UpdateProductDTO) {
    const updatedProduct = await this.updater.UpdateProduct(data, userid);
    return updatedProduct;
  }
  public async updatePayments(userid: string, data: UpdateProductPaymentDTO) {
    const updatedProduct = await this.updater.UpdateProductPayments(
      data,
      userid,
    );
    return updatedProduct;
  }
  public async toogleStatus(productid: string, status: Status) {
    const updatedProduct = await this.updater.UpdatePrductStatus(
      productid,
      status,
    );
    return updatedProduct;
  }
  public async updateProductChekout(
    data: EditProductChekoutDTO,
    userid: string,
  ) {
    const updater = await this.updater.UpdateProductChekout(data, userid);
    return updater;
  }

  public async canUpload(
    userid: string,
    data: canUploadDTO | undefined,
    isphotho: boolean = false,
  ) {
    const API_KEY = process.env.UPLOADTHING_TOKEN;
    const API_SERVER = process.env.UPLOAD_SERVER;
    try {
      const isActive = new IsActiveUser(this.database);
      const user = await isActive.isActive(userid);
      if (!data && user) {
        return {
          status: true,
          key: API_KEY,
          server: API_SERVER,
        };
      } else if (data && user) {
        const product = await this.database.products.findUnique({
          where: {
            id: data.productId,
          },
        });
        if (user && product && product.userId == userid) {
          return {
            status: true,
            key: API_KEY,
            server: API_SERVER,
          };
        }
      }
      return {
        message: 'Usuário não autorizado',
        status: false,
      };
    } catch (error) {
      return {
        message: 'Usuário não autorizado',
        status: false,
      };
    }
  }
  public async updateProductFile(
    userid: string,
    file: string,
    productid: string,
    type: 'cover' | 'file' | 'banner',
  ) {
    try {
      const isActive = new IsActiveUser(this.database);
      const user = await isActive.isActive(userid);
      const product = await this.database.products.findUnique({
        where: {
          id: productid,
          userId: userid,
        },
      });
      if (user && product) {
        const updated = await this.database.products.update({
          data: {
            file: type == 'file' ? file : product.file,
            banner: type == 'banner' ? file : product.banner,
            cover: type == 'cover' ? file : product.cover,
          },
          where: {
            id: productid,
          },
        });
        await this.database.products.update({
          data: {
            status: updated.banner && updated.file ? 'APROVED' : 'PENDING',
          },
          where: {
            id: productid,
          },
        });
        return {
          updated: updated?.id ? true : false,
          message: updated?.id ? 'Actualizado' : 'Erro ao actualizar',
        };
      }
      return {
        updated: false,
        message: 'Erro ao actualizar',
      };
    } catch (error) {
      return {
        updated: false,
        message: 'Erro ao actualizar',
      };
    }
  }
  //GETTER
  public async getAllProduct(
    userid: string | undefined,
    page: number = 1,
    list: string,
  ) {
    if (userid) {
      const data = await this.productGetter.getProductbyUser(
        userid,
        page,
        list,
      );
      return data;
    } else {
      const data = await this.productGetter.getAllProducts(page);
      return data;
    }
  }
  public async getAllProductByStatus(
    userid: string | undefined,
    page: number = 1,
    status: Status,
  ) {
    if (userid) {
      const data = await this.productGetter.getAllProductsByStatus(
        page,
        status,
        userid,
      );
      return data;
    } else {
      const data = await this.productGetter.getAllProductsByStatus(
        page,
        status,
        undefined,
      );
      return data;
    }
  }
  public async getStats(userid: string | undefined, role: string) {
    if (userid) {
      const data = await this.productGetter.asynGetProductStats(role, userid);
      return data;
    } else {
      const data = await this.productGetter.asynGetProductStats(role);
      return data;
    }
  }
  public async getProductById(id: string) {
    const data = await this.productGetter.getProductById(id);
    return data;
  }
  public async getProductOffers(productid: string,) {
    const offers = await this.productGetter.getProductOffeer(productid);
    return offers;
  }
  // DELETER
  public async deleteProduct(productId: string, userId: string) {
    const deleted = await this.delleter.deleteProduct({
      productId,
      userId,
    });
    return deleted;
  }
  public async deleteProductOffer(offerId: string, userId: string) {
    const deleted = await this.delleter.deleteOffer({
      userId,
      offerId,
    });
    return deleted;
  }
}
