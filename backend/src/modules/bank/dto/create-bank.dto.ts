import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateBankDto {
  @IsEmpty()
  userid: string;
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  iban: string;
  @IsString()
  image: string;
}
