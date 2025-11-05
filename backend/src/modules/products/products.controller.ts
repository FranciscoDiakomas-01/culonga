import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  Query,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  CreateOffer,
  EditProductChekoutDTO,
  UpdateProductDTO,
  UpdateProductFiles,
  UpdateProductPaymentDTO,
  canUploadDTO,
} from './dto/create-product.dto';
import { Status } from 'generated/prisma';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Put()
  public async update(
    @Body() data: UpdateProductDTO,
    @Headers('userid') userid: string,
  ) {
    return await this.productsService.update(userid, data);
  }

  @Post('canupload')
  public async canUpload(
    @Body() data: canUploadDTO,
    @Headers('userid') userid: string,
  ) {
    if (data.productId == 'profile' || data.productId == 'photo') {
      const canupload = this.productsService.canUpload(
        userid,
        undefined,
        data.productId == 'photo',
      );
      return canupload;
    }
    const canupload = this.productsService.canUpload(userid, data);
    return canupload;
  }
  @Post('upload')
  public async uploadFile(
    @Headers('userid') userid: string,
    @Body() data: UpdateProductFiles,
  ) {
    const res = await this.productsService.updateProductFile(
      userid,
      data.file,
      data.productId,
      data.type,
    );
    return res;
  }

  @Post('toogle/:id/:status')
  public async ToogleStatus(
    @Param('id') id: string,
    @Param('status') status: Status,
    @Headers('role') role: string,
  ) {
    if (role.toUpperCase() != 'ADMIN') {
      throw new UnauthorizedException('Usuário não tem permisão');
    }
    const res = await this.productsService.toogleStatus(id, status);
    return res;
  }

  @Put('payments')
  public async updateOffer(
    @Body() data: UpdateProductPaymentDTO,
    @Headers('userid') userid: string,
  ) {
    return await this.productsService.updatePayments(userid, data);
  }
  @Put('chekout')
  public async updateProductCheckout(
    @Body() data: EditProductChekoutDTO,
    @Headers('userid') userid: string,
  ) {
    return await this.productsService.updateProductChekout(data, userid);
  }

  // SETTERS
  @Post()
  public async createProduct(
    @Body() data: CreateProductDto,
    @Headers('userid') userid: string,
  ) {
    data.userId = userid;
    const createdProduct = await this.productsService.createProduct(data);
    return createdProduct;
  }
  @Post('offer')
  public async createOffers(
    @Body() data: CreateOffer,
    @Headers('userid') userid: string,
  ) {
    data.userId = userid;
    const createdProduct = await this.productsService.createOffers(data);
    return createdProduct;
  }
  //GETTER
  @Get()
  public async getAllProduct(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
    @Query('page') page: number = 1,
    @Query('list') list: string,
  ) {
    const data = await this.productsService.getAllProduct(
      role?.toUpperCase() != 'ADMIN' ? userid : undefined,
      page,
      list,
    );
    return data;
  }
  @Get(':id')
  public async getProductById(@Param('id') id: string) {
    const data = await this.productsService.getProductById(id);
    return data;
  }
  @Get('stats/:text')
  public async getStats(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
  ) {
    const data = await this.productsService.getStats(userid, role);
    return data;
  }
  @Get('offer/:productid')
  public async getProductOffers(@Param('productid') productid: string) {
    const data = await this.productsService.getProductOffers(productid);
    return data;
  }

  // DELETER
  @Delete(':id')
  public async deleleteProduct(
    @Param('id') id: string,
    @Headers('userid') userid: string,
  ) {
    return this.productsService.deleteProduct(id, userid);
  }
  @Delete('offer/:id')
  public async deleteProductOffer(
    @Param('id') id: string,
    @Headers('userid') userid: string,
  ) {
    return this.productsService.deleteProductOffer(id, userid);
  }
}
