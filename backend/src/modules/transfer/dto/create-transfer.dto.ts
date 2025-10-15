import { IsEmail, IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateTransferDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  @Min(1000)
  amount: number;
}
