import { IsEmail, IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateTransferDto {
  @IsEmail({}, { message: 'O e-mail do destinatário deve ser válido.' })
  @IsNotEmpty({ message: 'O e-mail do destinatário é obrigatório.' })
  to: string;

  @IsInt({ message: 'O valor da transferência deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O valor da transferência é obrigatório.' })
  @IsPositive({ message: 'O valor da transferência deve ser positivo.' })
  @Min(100, { message: 'O valor mínimo para transferência é de 1000 Kz.' })
  amount: number;
}
