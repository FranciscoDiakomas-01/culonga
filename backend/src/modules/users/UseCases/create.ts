import DatabaseService from 'src/services/database/database.service';
import { Logger } from '@nestjs/common';
import { CreateUserDto, LoginDTO } from '../dto/create-user.dto';
import JWTService from 'src/services/jwt/jwt.service';
import Cryptographer from 'src/services/crypto/crypto.service';
import EmailService from 'src/services/Email/email.service';
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
          if (User.code != 0) {
            const gerarCodigoUnico = async (): Promise<number> => {
              let code: number = 0; // inicializa com um valor qualquer
              let existe = true;

              while (existe) {
                code = Math.floor(1000 + Math.random() * 9000);
                const userWithCode = await this.database.users.findFirst({
                  where: { code },
                });
                existe = !!userWithCode;
              }

              return code;
            };
            const code = await gerarCodigoUnico();
            this.database.users.update({
              where: {
                email: User.email,
              },
              data: {
                code,
              },
            });
            await new EmailService().senEmail({
              html: `<p>Seu código de confirmação é: <b>${code}</b></p>`,
              to: User.email,
              subject: 'Código de Confirmação',
            });
            return {
              message: 'Enviamos um código de verificação',
              descption: 'Verifique a caixa postal do seu email',
              logged: true,
              token : "VERIFYCODE"
            };
          }
          return {
            looged: User?.id ? true : false,
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
      const gerarCodigoUnico = async (): Promise<number> => {
        let code: number = 0; // inicializa com um valor qualquer
        let existe = true;

        while (existe) {
          code = Math.floor(1000 + Math.random() * 9000);
          const userWithCode = await this.database.users.findFirst({
            where: { code },
          });
          existe = !!userWithCode;
        }

        return code;
      };
      const code = await gerarCodigoUnico();
      const hashPasword = await this.EncryptService.createHash(User.password);
      const createdUser = await this.database.users.create({
        data: {
          ...User,
          role: 'SELLER',
          status: 'CREATED',
          password: hashPasword,
          code,
        },
      });

      if (!createdUser) {
        return {
          message: 'Erro ao criar conta',
        };
      }

      await new EmailService().senEmail({
        html: `<p>Seu código de confirmação é: <b>${code}</b></p>`,
        to: createdUser.email,
        subject: 'Código de Confirmação',
      });
      return {
        message: 'Enviamos um código de verificação no seu email',
        created: createdUser?.id ? true : false,
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao criar usuário');
      return {
        message: 'Erro ao criar usuário',
      };
    }
  }
}
