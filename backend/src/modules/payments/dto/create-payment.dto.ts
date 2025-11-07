import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt({ message: 'Método de pagamento inválido' })
  @IsNotEmpty({ message: 'Método de pagamento inválido' })
  method: number;

  @IsInt({ message: 'Total pago  inválido' })
  @IsNotEmpty({ message: 'Total pago  inválido' })
  @Min(1, { message: 'Total pago  inválido' })
  amount: number;

  @IsUUID(undefined, { message: 'Id inválido do produto' })
  @IsNotEmpty({ message: 'Id inválido do produto' })
  productId: string;

  @IsArray({ message: 'Orderbumps inválidos' })
  orderbumps: string[];

  @IsString({ message: 'Nome precisa ser texto' })
  @IsNotEmpty({ message: 'Nome precisa ser texto' })
  name: string;

  @IsString({ message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email inválido' })
  @IsEmail(undefined, { message: 'Email inválido' })
  email: string;

  @IsString({ message: 'Telefone inválido' })
  @IsNotEmpty({ message: 'Telefone inválido' })
  @IsPhoneNumber('AO', { message: 'Telefone inválido' })
  tel: string;

  @IsString({ message: 'Id do proprietário inválido inválido' })
  @IsNotEmpty({ message: 'Id do proprietário inválido inválido' })
  @IsUUID(undefined, { message: 'Id do proprietário inválido inválido' })
  userid: string;

  @IsString({ message: 'Cupon inválido' })
  @IsOptional({ message: 'Cupon inválido' })
  cuponCode?: string;

  @IsString({ message: 'Cupon inválido' })
  @IsOptional({ message: 'Cupon inválido' })
  afiateCode?: string;
}
