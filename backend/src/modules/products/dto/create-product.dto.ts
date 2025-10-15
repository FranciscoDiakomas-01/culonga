import {
  IsArray,
  IsEmpty,
  IsIn,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'A descrição precisa ser textual' })
  @IsNotEmpty({ message: 'A descrição não deve ser vazia' })
  description: string;

  @IsNotEmpty({ message: 'Preço deve ser enviado' })
  @IsInt({ message: 'Preço precisa ser um número' })
  @Min(100, { message: 'Preço mínimo é 100' })
  price: number;

  @IsString({ message: 'O nome precisa ser textual' })
  @IsNotEmpty({ message: 'O nome não deve ser vazio' })
  title: string;

  @IsEmpty()
  userId: string;

  @IsString({ message: 'O tipo precisa ser textual' })
  @IsNotEmpty({ message: 'O tipo não deve ser vazio' })
  type: string;
}

export class CreateOffer {
  @IsString({ message: 'O Id do produto precisa ser textual' })
  @IsNotEmpty({ message: 'O Id do produto não deve ser vazio' })
  productId: string;
  @IsNotEmpty({ message: 'Preço deve ser enviado' })
  @IsInt({ message: 'Preço precisa ser um número' })
  @Min(100, { message: 'Preço mínimo é 100' })
  price: number;
  @IsString({ message: 'O nome precisa ser textual' })
  @IsNotEmpty({ message: 'O nome não deve ser vazio' })
  title: string;

  @IsEmpty()
  userId: string;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Suporte do whatsap inválido',
  })
  @IsNotEmpty({ message: 'Suporte do whatsap precisa ser preenchido' })
  @IsString({ message: 'Suporte do whatsap precisa ser preenchido' })
  whatsapp: string;

  @IsInt({ message: 'Garantia em dias' })
  @Min(1, { message: 'Valor minimo 1' })
  @IsNotEmpty({ message: 'Garantia deve existir' })
  garant: number;

  @IsOptional()
  @IsString({ message: 'A categoria precisa ser textual' })
  @IsNotEmpty({ message: 'A categoria não deve ser vazio' })
  category: string;

  @IsString({ message: 'A descrição precisa ser textual' })
  @IsNotEmpty({ message: 'A descrição não deve ser vazia' })
  description: string;

  @IsNotEmpty({ message: 'Preço deve ser enviado' })
  @IsInt({ message: 'Preço precisa ser um número' })
  @Min(100, { message: 'Preço mínimo é 100' })
  price: number;

  @IsString({ message: 'O nome precisa ser textual' })
  @IsNotEmpty({ message: 'O nome não deve ser vazio' })
  title: string;

  @IsNotEmpty()
  @IsUUID(undefined, { message: 'UUId inválido' })
  productId: string;

  @IsString({ message: 'O tipo precisa ser textual' })
  @IsNotEmpty({ message: 'O tipo não deve ser vazio' })
  type: string;

  @IsString({ message: 'O PixelId precisa ser textual' })
  @IsOptional({ message: 'O PixelId precisa ser textual' })
  pixelId: string;

  @IsString({ message: 'O upsell precisa ser textual' })
  @IsOptional({ message: 'O upsell precisa ser textual' })
  UpSell: string;

  @IsString({ message: 'O backredirect precisa ser textual' })
  @IsOptional({ message: 'O backredirect precisa ser textual' })
  backRedirect: string;

  @IsArray({})
  orderBump: string[];
}

export class EditProductChekoutDTO {
  @IsNotEmpty()
  @IsUUID(undefined, { message: 'UUId inválido' })
  id: string;

  @IsNotEmpty()
  @IsString()
  bg: string;

  @IsNotEmpty()
  @IsString()
  textColor: string;

  @IsOptional()
  @IsNotEmpty()
  timer?: any;

  @IsOptional()
  @IsNotEmpty()
  btn?: any;

  @IsOptional()
  @IsNotEmpty()
  orderbump?: any;
}

export class UpdateProductFiles {
  @IsNotEmpty()
  @IsUUID(undefined, { message: 'UUId inválido' })
  productId: string;
  @IsNotEmpty()
  @IsIn(['banner', 'cover', 'file'])
  @IsString()
  type: 'banner' | 'cover' | 'file';

  @IsUrl(undefined, { message: 'URL inválida' })
  @IsNotEmpty({ message: 'URL inválida' })
  file: string;
}
export class UpdateProductPaymentDTO {
  @IsNotEmpty()
  @IsNotEmpty()
  payments: number[];

  @IsNotEmpty()
  @IsUUID(undefined, { message: 'UUId inválido' })
  productId: string;
}

export class canUploadDTO {
  @IsNotEmpty({ message: 'Id inválido' })
  @IsString({ message: 'Id inválido' })
  productId: string;
  @IsNotEmpty()
  @IsIn(['banner', 'cover', 'file'])
  @IsString()
  type: 'banner' | 'cover' | 'file';
}
