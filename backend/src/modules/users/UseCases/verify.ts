import { Logger } from '@nestjs/common';
import PrismaService from '../../../services/database/database.service';
import { VerifyUserDTO, ToogleUserVerification } from '../dto/create-user.dto';
import EmailService from 'src/services/Email/email.service';
export default class UserVerifier {
  private readonly logger = new Logger('UserVerifier');
  constructor(private readonly database: PrismaService) {}
  public async verify(data: VerifyUserDTO, id: string) {
    try {
      const User = await this.database.users.findUnique({
        where: {
          id,
        },
      });
      if (User) {
        const hasPendingVerification =
          await this.database.userVerification.findUnique({
            where: {
              userId: id,
            },
          });
        if (hasPendingVerification) {
          await this.database.userVerification.update({
            data: {
              images: JSON.stringify(data),
            },
            where: {
              userId: id,
            },
          });
          await this.database.users.update({
            data: {
              status: 'PENDING',
            },
            where: {
              id,
            },
          });
          return {
            message: 'Pedido de verificação actualizada',
            created: false,
          };
        } else {
          const createdVerification =
            await this.database.userVerification.create({
              data: {
                images: JSON.stringify(data),
                userId: id,
              },
            });
          if (createdVerification?.id) {
            const updated = await this.database.users.update({
              data: {
                status: 'PENDING',
              },
              where: {
                id,
              },
            });

            const email = new EmailService();
            await email.senEmail({
              html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Culonga • Verificação em andamento</title>
  <style>
    :root {
      --brand: #6c5ce7;
      --brand-dark: #5847e0;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
    }
    body { margin:0; padding:0; background: var(--bg); font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color: var(--text); }
    .wrapper { padding: 32px 16px; }
    .container { max-width: 480px; margin:0 auto; background: var(--card); border-radius: 16px; box-shadow: 0 6px 20px rgba(17,24,39,0.08); overflow:hidden; }
    .header { padding:20px; background:linear-gradient(135deg,var(--brand),var(--brand-dark)); color:white; text-align:center; font-weight:700; font-size:18px; }
    .content { padding:24px; text-align:center; }
    .paragraph { font-size:15px; color:#374151; line-height:1.5; }
    .footer { padding:16px; text-align:center; font-size:12px; color: var(--muted); }
    @media (prefers-color-scheme: dark) {
      body { background:#0b1220; color:#e5e7eb; }
      .container { background:#0f172a; }
      .paragraph { color:#cbd5e1; }
      .footer { color:#94a3b8; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">Culonga</div>
      <div class="content">
        <p class="paragraph">
          Olá ${User.name}, seus documentos foram recebidos e estão em <strong>verificação</strong>.
        </p>
        <p class="paragraph" style="font-size:13px; color:#6b7280; margin-top:16px;">
          Avisaremos por e-mail assim que o processo for concluído.
        </p>
      </div>
      <div class="footer">
        © 2025 Culonga • suporte@Culonga.com
      </div>
    </div>
  </div>
</body>
</html>`,
              to: User.email,
              subject: 'Culonga • Verificação em andamento',
            });

            return {
              message: updated?.id
                ? 'Por favor aguarde a sua verificação'
                : 'Erro ao criar a verificação',
              created: updated?.id ? true : false,
            };
          }
          return {
            message: 'Erro ao criar a verificação',
            created: false,
          };
        }
      } else {
        return {
          message: 'Sua conta foi banida',
          created: false,
        };
      }
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao encontrar o usuário');
      return {
        message: 'Erro ao encontrar o usuário',
        created: false,
      };
    }
  }
  public async toogleVerification(data: ToogleUserVerification) {
    try {
      try {
        const User = await this.database.users.findUnique({
          where: {
            id: String(data.userid),
          },
        });
        if (User) {
          const mappedStatus =
            data.status == '1'
              ? 'APROVED'
              : data.status == '2'
                ? 'BANED'
                : 'CREATED';
          const updatedUser = await this.database.users.update({
            data: {
              status: mappedStatus,
            },
            where: {
              id: String(data.userid),
            },
          });
          //email
          const email = new EmailService();
          email.senEmail({
            subject: `Culonga | Vendedor ${mappedStatus == 'APROVED' ? 'Aprovado' : 'Reprovado'}`,
            html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Culonga | ${mappedStatus == 'APROVED' ? 'Aprovado' : 'Reprovado'}</title>
</head>
<body>
  <p>Olá, ${updatedUser.name + ' ' + updatedUser.lastname}! 🎉</p>
  <p>A sua conta foi ${mappedStatus == 'APROVED' ? 'Aprovado' : 'Reprovado'} pela equipe da Culonga .</p>
  <p>Suporte: <a href="mailto:suporte@Culonga.com">suporte@Culonga.com</a></p>
</body>
</html>`,
            to: updatedUser.email,
          });
          return {
            message: updatedUser?.id
              ? 'Usuário actualizado'
              : 'Erro ao actualizar usuário',
            updated: updatedUser?.id ? true : false,
          };
        }
        return {
          message: 'Usuário não encontrado',
          updated: false,
        };
      } catch (error) {}
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao encontrar o usuário');
      return {
        message: 'Erro ao encontrar o usuário',
        updated: false,
      };
    }
  }
}
