import DatabaseService from 'src/services/database/database.service';
import { Logger } from '@nestjs/common';
import {
  Recovery,
  UpdatePasswordDTO,
  UpdatePassWordFromTokenDTO,
  UpdateUserDto,
} from '../dto/create-user.dto';
import JWTService from 'src/services/jwt/jwt.service';
import Cryptographer from 'src/services/crypto/crypto.service';
import EmailService from 'src/services/Email/email.service';
export default class UserUpedater {
  private readonly logger = new Logger('UserUpdater');
  private readonly JWTservice = new JWTService();
  private readonly EncryptService = new Cryptographer();
  constructor(private readonly database: DatabaseService) {}
  public async UpdateProfile(data: UpdateUserDto, id: string) {
    try {
      const updatedUser = await this.database.users.update({
        data: {
          lastname: data.lastname,
          name: data.name,
          telefone: data.telefone,
          profile: data.file,
          email: data.email,
        },
        where: {
          id,
        },
      });
      return {
        message: updatedUser?.id
          ? 'Perfil alterado'
          : 'Erro ao actualizar os dados do usuário',
        updated: updatedUser?.id ? true : false,
      };
    } catch (error) {
      this.logger.log('Erro ao actualizar os dados do usuário');
      return {
        message: 'Erro ao actualizar os dados do usuário',
      };
    }
  }
  public async UpdatePassword(data: UpdatePasswordDTO, id: string) {
    try {
      const User = await this.database.users.findUnique({
        where: {
          id,
        },
      });

      if (User) {
        const isPasswordMatch = await this.EncryptService.veriFyHash({
          hash: User.password,
          password: data.oldpassword,
        });

        if (isPasswordMatch) {
          const newHashedPassword = await this.EncryptService.createHash(
            data.password,
          );
          const updated = await this.database.users.update({
            data: {
              password: newHashedPassword,
            },
            where: {
              id,
            },
          });

          return {
            message: updated?.id
              ? 'Senha redefinida'
              : 'Erro ao actualizar a senha',
            updated: updated?.id ? true : false,
          };
        }
        return {
          message: 'Senha incorrecta',
        };
      }
    } catch (error) {
      this.logger.log('Erro ao actualizar a senha do usuário');
      return {
        message: 'Erro ao actualizar a senha do usuário',
      };
    }
  }
  public async ResetPassword(data: Recovery) {
    try {
      const User = await this.database.users.findUnique({
        where: {
          email: data.email,
        },
      });
      if (User) {
        const token = this.JWTservice.signRecoveryRequest(User.id);
        const Request = await this.database.resetPassword.create({
          data: {
            userid: User.id,
            token: token,
            status: 'PENDING',
          },
        });
        if (Request.id) {
          const emailservice = new EmailService();
          await emailservice.senEmail({
            to: User.email,
            subject: 'Culonga | Redefinir senha',
            html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Culonga | Redefinir senha</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#0d0d0d; color:#e1e1e6; line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background-color:#1a1a1a; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.4);">
    <tr>
      <td style="background:linear-gradient(90deg, #8257e5, #996dff); padding:20px; text-align:center;">
        <h1 style="margin:0; color:#fff; font-size:22px; font-weight:bold;">Culonga</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;">
        <p style="margin:0 0 15px 0; font-size:16px;">Olá, <strong>${User.name + ' ' + User.lastname}</strong> 👋</p>
        <p style="margin:0 0 15px 0; font-size:15px; color:#c4c4cc;">
          Recebemos seu pedido de recuperação de conta. Use o botão abaixo para criar uma nova senha. 
        </p>
        <p style="text-align:center; margin:30px 0;">
            <a href="${process.env.RESETLINK + "/" + Request.token}" target="_blank" 
            style="display:inline-block; background:linear-gradient(90deg,#8257e5,#996dff); color:#fff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; font-size:15px;">
            🔑 Redefinir senha
          </a>
        </p>
        <p style="font-size:13px; color:#999;">Este link expira em 1 hora.</p>
        <p style="margin-top:20px; font-size:14px; color:#c4c4cc;">
          Se não foi você que solicitou, basta ignorar este e-mail.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#111; text-align:center; padding:15px; font-size:13px; color:#777;">
        Precisa de ajuda? <a href="mailto:suporte@Culonga.com" style="color:#8257e5; text-decoration:none;">suporte@Culonga.com</a>
      </td>
    </tr>
  </table>
</body>
</html>`,
          });

          return {
            message: 'Consulte o seu email',
          };
        } else {
          return {
            message: 'Erro ao criar o pedido',
          };
        }
      } else {
        return {
          message: 'Conta não encontrada',
        };
      }
    } catch (error) {
      this.logger.log('Erro ao encontrar a senha do usuário');
      return {
        message: 'Erro ao encontrar a senha do usuário',
      };
    }
  }
  public async UpdatePassWordFromToken(data: UpdatePassWordFromTokenDTO) {
    try {
      const isValidToken = this.JWTservice.verify(data.token);

      if (isValidToken) {
        const payload = this.JWTservice.decode(data.token) as {
          userid: string | number;
        };
        if (payload?.userid) {
          const User = await this.database.users.findUnique({
            where: {
              id: String(payload.userid),
            },
          });
          if (User && User.status != 'BANED') {
            const newHasHedPassword = await this.EncryptService.createHash(
              data.password,
            );
            const updatedUser = await this.database.users.update({
              data: {
                password: newHasHedPassword,
              },
              where: {
                id: String(payload.userid),
              },
            });
            return {
              message: updatedUser?.id
                ? 'Senha redefinida'
                : 'Errro ao actualizar a senha',
              updated: updatedUser?.id ? true : false,
            };
          } else {
            return {
              message: 'Conta banida ou não encontrada',
            };
          }
        }
        return {
          message: 'Código expirado , tente novamente',
        };
      }
      return {
        message: 'Código expirado , tente novamente',
      };
    } catch (error) {
      this.logger.log('Erro ao encontrar a senha do usuário');
      return {
        message: 'Erro ao encontrar a senha do usuário',
      };
    }
  }
}
