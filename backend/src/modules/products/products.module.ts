import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import DatabaseService from 'src/services/database/database.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService , DatabaseService],
})
export class ProductsModule {}
