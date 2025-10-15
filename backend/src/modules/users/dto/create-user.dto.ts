import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsIn,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Nome precisa ser texto' })
  @MinLength(3, { message: 'Nome precisa ter 3 carácteres' })
  @IsNotEmpty({ message: 'Nome precisa ser preechido' })
  name: string;

  @IsString({ message: 'Sobrenome precisa ser texto' })
  @MinLength(3, { message: 'Sobrenome precisa ter 3 carácteres' })
  @IsNotEmpty({ message: 'Sobrenome precisa ser preechido' })
  lastname: string;

  @IsPhoneNumber(undefined, {
    message: 'Precisa ser um número válido',
  })
  telefone: string;

  @IsNotEmpty({ message: 'Email precisa ser preechido' })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString({ message: 'senha precisa ser texto' })
  @MinLength(8, { message: 'senha precisa ter 8 carácteres' })
  @IsNotEmpty({ message: 'senha precisa ser preechido' })
  password: string;
}

export class LoginDTO {
  @IsNotEmpty({ message: 'Email precisa ser preechido' })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString({ message: 'senha precisa ser texto' })
  @IsNotEmpty({ message: 'senha precisa ser preechido' })
  password: string;
}

export class Recovery {
  @IsNotEmpty({ message: 'Email precisa ser preechido' })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;
}

export class UpdateUserDto {
  @IsString({ message: 'Nome precisa ser texto' })
  @MinLength(3, { message: 'Nome precisa ter 3 carácteres' })
  @IsNotEmpty({ message: 'Nome precisa ser preechido' })
  name: string;
  @IsString({ message: 'Sobrenome precisa ser texto' })
  @MinLength(3, { message: 'Sobrenome precisa ter 3 carácteres' })
  @IsNotEmpty({ message: 'Sobrenome precisa ser preechido' })
  lastname: string;
  @IsPhoneNumber(undefined, {
    message: 'Precisa ser um número válido',
  })
  telefone: string;

  @IsNotEmpty({ message: 'Email precisa ser preechido' })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Imagem precisa ser um texto' })
  @IsUrl({}, { message: 'Imagem deve ser uma URL válida' })
  file: string;
}

export class UpdatePasswordDTO {
  @IsString({ message: 'senha precisa ser texto' })
  @IsNotEmpty({ message: 'senha precisa ser preechido' })
  password: string;
  @IsString({ message: 'senha precisa ser texto' })
  @IsNotEmpty({ message: 'senha precisa ser preechido' })
  oldpassword: string;
}

export class VerifyUserDTO {
  @IsUrl(undefined, { message: 'Link deve ser válido' })
  @IsNotEmpty({ message: 'Deve ser preenchido' })
  front: string;

  @IsUrl(undefined, { message: 'Link deve ser válido' })
  @IsNotEmpty({ message: 'Deve ser preenchido' })
  back: string;

  @IsUrl(undefined, { message: 'Link deve ser válido' })
  @IsNotEmpty({ message: 'Deve ser preenchido' })
  selfie: string;
}

export class ToogleUserVerification {
  @IsIn(['0', '1', '2'])
  @IsNotEmpty({ message: 'Especifica o status' })
  status: '0' | '1' | '2';

  @IsUUID(undefined, { message: 'Uuid inválido' })
  @IsNotEmpty({ message: 'Id deve ser enviado' })
  userid: String;
}

export class UpdatePassWordFromTokenDTO {
  @IsJWT({ message: 'Tente novamente' })
  @IsNotEmpty({ message: 'O Código precisa ser enviado' })
  token: string;

  @IsString({ message: 'senha precisa ser texto' })
  @MinLength(8, { message: 'senha precisa ter 8 carácteres' })
  @IsNotEmpty({ message: 'senha precisa ser preechido' })
  password: string;
}
