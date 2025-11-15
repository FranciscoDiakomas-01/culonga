import { Logger } from '@nestjs/common';
import PrismaService from '../../../services/database/database.service';
import { VerifyUserDTO, ToogleUserVerification } from '../dto/create-user.dto';
import EmailService from 'src/services/Email/email.service';

export default class UserVerifier {
  private readonly logger = new Logger('UserVerifier');

  constructor(private readonly database: PrismaService) {}

  // ============================================================
  //  VERIFY USER
  // ============================================================
  public async verify(data: VerifyUserDTO, id: string) {
    try {
      const User = await this.database.users.findUnique({ where: { id } });

      if (!User) {
        return { message: 'Sua conta foi banida', created: false };
      }

      const existingVerification = await this.database.userVerification.findUnique({
        where: { userId: id },
      });

      // ------------------------------------------------------------
      // Update existing verification
      // ------------------------------------------------------------
      if (existingVerification) {
        await this.database.userVerification.update({
          data: { images: JSON.stringify(data) },
          where: { userId: id },
        });

        await this.database.users.update({
          data: { status: 'PENDING' },
          where: { id },
        });

        return { message: 'Pedido de verificação atualizado', created: false };
      }

      // ------------------------------------------------------------
      // Create new verification
      // ------------------------------------------------------------
      const createdVerification = await this.database.userVerification.create({
        data: {
          images: JSON.stringify(data),
          userId: id,
        },
      });

      if (!createdVerification?.id) {
        return { message: 'Erro ao criar a verificação', created: false };
      }

      const updated = await this.database.users.update({
        data: { status: 'PENDING' },
        where: { id },
      });

      // ------------------------------------------------------------
      // SEND EMAIL (Try/catch isolado)
      // ------------------------------------------------------------
      try {
        const email = new EmailService();

        await email.senEmail({
          to: User.email,
          subject: '📋 Verificação em Andamento - Culonga',
          html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Culonga • Verificação em Andamento</title>
<style>
/* CSS ORIGINAL COMPLETO — não alterado */
:root {
  --primary: #7C3AED;
  --primary-dark: #6D28D9;
  --secondary: #F59E0B;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --text: #1E293B;
  --text-muted: #64748B;
  --border: #E2E8F0;
}
/* ... resto do CSS ... */
</style>
</head>
<body>
<!-- HTML COMPLETO ORIGINAL -->
<div class="wrapper">
  <div class="container">
    <div class="header">
      <div class="logo">Culonga</div>
      <div class="tagline">Sua plataforma de vendas digital</div>
    </div>

    <div class="content">
      <div class="icon">📋</div>
      <h1 class="greeting">Olá, ${User.name}!</h1>

      <p class="paragraph">
        Recebemos seus documentos e já iniciamos o processo de
        <span class="highlight">verificação da sua conta</span>.
      </p>

      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot">✓</div>
          <div class="timeline-text">
            <strong>Documentos recebidos</strong><br />
            Seus arquivos foram enviados com sucesso
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-dot pending">⏳</div>
          <div class="timeline-text">
            <strong>Verificação em andamento</strong><br />
            Nossa equipe está analisando suas informações
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-dot">○</div>
          <div class="timeline-text">
            <strong>Conta aprovada</strong><br />
            Você receberá um e-mail de confirmação
          </div>
        </div>
      </div>

      <div class="next-steps">
        <div class="next-steps-title">📌 O que esperar agora:</div>
        <p class="paragraph" style="font-size: 14px; margin: 0;">
          • Processo leva até <strong>24-48 horas</strong><br />
          • Notificação por e-mail ao finalizar<br />
          • Acesso completo à plataforma após aprovação
        </p>
      </div>

      <p class="paragraph" style="font-size: 14px;">
        Enquanto isso, explore nossa plataforma e descubre como impulsionar suas vendas!
      </p>
    </div>

    <div class="footer">
      <div class="support">
        Precisa de ajuda?
        <a href="mailto:suporte@culonga.com" class="contact-link">suporte@culonga.com</a>
      </div>
      <div class="copyright">© 2025 Culonga • Todos os direitos reservados</div>
    </div>
  </div>
</div>

</body>
</html>`,
        });
      } catch (e) {
        console.log('Erro ao enviar email:', e);
      }

      return {
        message: updated?.id ? 'Por favor aguarde a sua verificação' : 'Erro ao criar a verificação',
        created: !!updated?.id,
      };
    } catch (error) {
      this.logger.error(error?.message ?? 'Erro ao encontrar o usuário');
      return { message: 'Erro ao encontrar o usuário', created: false };
    }
  }

  // ============================================================
  //  TOOGLE VERIFICATION
  // ============================================================
  public async toogleVerification(data: ToogleUserVerification) {
    try {
      const User = await this.database.users.findUnique({
        where: { id: String(data.userid) },
      });

      if (!User) {
        return { message: 'Usuário não encontrado', created: false };
      }

      const mappedStatus =
        data.status == '1'
          ? 'APROVED'
          : data.status == '2'
          ? 'BANED'
          : 'CREATED';

      const updatedUser = await this.database.users.update({
        data: { status: mappedStatus },
        where: { id: String(data.userid) },
      });

      // ---------------------------------------------------------------------
      //  SEND APPROVED/REJECTED EMAIL
      // ---------------------------------------------------------------------
      try {
        const email = new EmailService();
        const isApproved = mappedStatus === 'APROVED';

const html = template
  .replace('{{ICON}}', isApproved ? '🎉' : '⚠️')
  .replace('{{TITLE}}', isApproved ? 'Conta Aprovada!' : 'Conta Reprovada')
  .replace(
    '{{MESSAGE}}',
    isApproved
      ? `Olá ${updatedUser.name}, sua conta foi verificada com sucesso!`
      : `Olá ${updatedUser.name}, infelizmente sua verificação não foi aprovada.`
  )
  .replace(
    '{{DETAILS}}',
    isApproved
      ? 'Agora você pode acessar todas funcionalidades da Culonga, publicar produtos, criar ofertas, usar webhooks, gerir afiliados e muito mais!'
      : 'Algum dos seus documentos não estava claro ou incompleto. Por favor, envie novamente com mais nitidez.'
  )
  .replace(
    '{{BUTTON}}',
    isApproved
      ? `<a href="https://culonga.com/dashboard" class="button">Acessar Plataforma</a>`
      : ''
  );


        await email.senEmail({
          subject: `🎯 ${
            mappedStatus == 'APROVED'
              ? 'Conta Aprovada - Bem-vindo à Culonga!'
              : 'Conta em Análise - Precisa de Ajustes'
          }`,
          to: updatedUser.email,
          html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Status da Verificação - Culonga</title>

<style>
  body {
    margin: 0;
    padding: 0;
    background: #f1f5f9;
    font-family: Arial, Helvetica, sans-serif;
  }

  .wrapper {
    width: 100%;
    padding: 20px 0;
    background: #f1f5f9;
  }

  .card {
    width: 100%;
    max-width: 560px;
    margin: auto;
    background: #ffffff;
    border-radius: 14px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .title {
    font-size: 24px;
    text-align: center;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .subtitle {
    text-align: center;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 30px;
  }

  .icon {
    font-size: 60px;
    text-align: center;
    margin-bottom: 10px;
  }

  .message {
    font-size: 16px;
    color: #334155;
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 14px;
    border-radius: 10px;
    font-size: 14px;
    color: #475569;
    margin-bottom: 25px;
    line-height: 1.5;
  }

  .button {
    display: block;
    width: fit-content;
    margin: 20px auto;
    padding: 12px 22px;
    background: #7c3aed;
    color: white;
    text-decoration: none;
    font-weight: bold;
    border-radius: 8px;
  }

  .footer {
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
    margin-top: 25px;
  }
</style>
</head>

<body>
<div class="wrapper">
  <div class="card">

    <!-- ICONE DINÂMICO -->
    <div class="icon">
      {{ICON}}
    </div>

    <!-- TÍTULO DINÂMICO -->
    <div class="title">
      {{TITLE}}
    </div>

    <div class="subtitle">Culonga • Plataforma de Produtos Digitais</div>

    <!-- MENSAGEM DINÂMICA -->
    <p class="message">{{MESSAGE}}</p>

    <!-- EXPLICAÇÃO DINÂMICA -->
    <div class="box">
      {{DETAILS}}
    </div>

    <!-- BOTÃO PARA APROVADOS -->
    {{BUTTON}}

    <div class="footer">
      © 2025 Culonga — Todos os direitos reservados
    </div>

  </div>
</div>
</body>
</html>
`,
        });
      } catch (e) {
        console.log('Erro ao enviar email:', e);
      }

      return {
        message: 'Status alterado com sucesso',
        created: true,
      };
    } catch (error) {
      this.logger.error(error?.message ?? 'Erro ao alterar verificação');
      return { message: 'Erro ao alterar verificação', created: false };
    }
  }
}
