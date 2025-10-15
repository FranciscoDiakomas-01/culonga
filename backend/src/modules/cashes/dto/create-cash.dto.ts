import {
  IsEmpty,
  IsEnum,
  IsIBAN,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'O campo "bank" não pode estar vazio.' })
  @IsString({ message: 'O campo "bank" deve ser uma string válida.' })
  bank: string;

  @IsNumber(undefined, { message: 'O montante deve ser número' })
  @IsNotEmpty({ message: 'O montante deve ser número' })
  @Min(1000, { message: 'O montante deve ser no mínimo 1000' })
  amount: number;

  @IsNotEmpty({ message: 'O campo iban não pode estar vazio.' })
  @IsString({ message: 'O campo iban deve ser uma string.' })
  iban: string;

  @IsEmpty()
  @IsOptional()
  userid: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(Status)
  status: Status;
  @IsString()
  @IsNotEmpty()
  id : string
}
