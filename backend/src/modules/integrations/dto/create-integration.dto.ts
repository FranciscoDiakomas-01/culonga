import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateIntegrationDto {
  @IsOptional()
  @IsEmpty({ message: 'O campo userid deve estar vazio.' })
  userid: string;

  @IsString({ message: 'O campo platform deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo platform não pode estar vazio.' })
  platform: string;

  @IsString({ message: 'O campo url deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo url não pode estar vazio.' })
  url: string;
}
