import DatabaseService from 'src/services/database/database.service';
import { Logger } from '@nestjs/common';
import { CreateUserDto, LoginDTO } from '../dto/create-user.dto';
import JWTService from 'src/services/jwt/jwt.service';
import Cryptographer from 'src/services/crypto/crypto.service';
export default class UserSetter {
  private readonly logger = new Logger('UserSetter >> ');
  private readonly JWTservice = new JWTService();
  private readonly EncryptService = new Cryptographer();
  constructor(private readonly database: DatabaseService) {}

  public async LogIn(data: LoginDTO) {
    try {
      const User = await this.database.users.findUnique({
        where: {
          email: data.email,
        },
      });
      if (User) {
        if (User.status == 'BANED' || User.status == 'CANCELED') {
          return {
            looged: false,
            message: 'A sua conta foi banida',
          };
        }
        const PasWordMathc = await this.EncryptService.veriFyHash({
          hash: User.password,
          password: data.password,
        });
        if (PasWordMathc) {
          return {
            looged: true,
            token: User?.id
              ? this.JWTservice.sign({
                  userid: User.id,
                  role: User.role,
                  createdAt: new Date(),
                  expireAt: new Date(),
                })
              : '',
          };
        }
        this.logger.log('Senha incorecta');
        return {
          message: 'Senha incorecta',
        };
      }
      return {
        message: 'A sua conta não foi encontrada',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao criar usuário');
      return {
        message: 'Erro acessar conta',
      };
    }
  }
  public async SignIn(User: CreateUserDto) {
    try {
      const hashPasword = await this.EncryptService.createHash(User.password);
      const createdUser = await this.database.users.create({
        data: {
          ...User,
          role: 'SELLER',
          status: 'CREATED',
          password: hashPasword,
        },
      });

      if (!createdUser) {
        return {
          message: 'Erro ao criar conta',
        };
      }

      return {
        looged: createdUser?.id ? true : false,
        token: createdUser?.id
          ? this.JWTservice.sign({
              userid: createdUser.id,
              role: createdUser.role,
              createdAt: new Date(),
              expireAt: new Date(),
            })
          : '',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao criar usuário');
      return {
        message: 'Erro ao criar usuário',
      };
    }
  }
}
