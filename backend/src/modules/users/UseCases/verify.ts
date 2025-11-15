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

            try{
              
            const email = new EmailService();
            await email.senEmail({
              html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Culonga • Verificação em Andamento</title>
  <style>
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
    
    body { 
      margin: 0; 
      padding: 0; 
      background: var(--bg); 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      color: var(--text); 
      line-height: 1.6;
    }
    
    .wrapper { 
      padding: 40px 20px; 
    }
    
    .container { 
      max-width: 500px; 
      margin: 0 auto; 
      background: var(--card); 
      border-radius: 20px; 
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
      overflow: hidden;
      border: 1px solid var(--border);
    }
    
    .header { 
      padding: 30px; 
      background: linear-gradient(135deg, var(--primary), var(--primary-dark)); 
      color: white; 
      text-align: center; 
    }
    
    .logo { 
      font-size: 28px; 
      font-weight: 800; 
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
    }
    
    .content { 
      padding: 40px 30px; 
      text-align: center; 
    }
    
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #FEF3C7, #F59E0B);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 32px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--text);
    }
    
    .paragraph { 
      font-size: 16px; 
      color: var(--text-muted); 
      margin-bottom: 20px;
    }
    
    .highlight {
      color: var(--primary);
      font-weight: 600;
    }
    
    .timeline {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    
    .timeline-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .timeline-item:last-child {
      margin-bottom: 0;
    }
    
    .timeline-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary);
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
    }
    
    .timeline-dot.pending {
      background: var(--secondary);
      animation: pulse 2s infinite;
    }
    
    .timeline-text {
      font-size: 14px;
      color: var(--text-muted);
    }
    
    .timeline-text strong {
      color: var(--text);
    }
    
    .next-steps {
      background: linear-gradient(135deg, #F0F9FF, #E0F2FE);
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid var(--primary);
    }
    
    .next-steps-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid var(--border);
    }
    
    .support {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    
    .copyright {
      font-size: 12px;
      color: var(--text-muted);
      opacity: 0.7;
    }
    
    .contact-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    @media (max-width: 600px) {
      .wrapper { padding: 20px 16px; }
      .content { padding: 30px 20px; }
      .greeting { font-size: 22px; }
    }
  </style>
</head>
<body>
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
          Recebemos seus documentos e já iniciamos o processo de <span class="highlight">verificação da sua conta</span>.
        </p>
        
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-dot">✓</div>
            <div class="timeline-text">
              <strong>Documentos recebidos</strong><br>
              Seus arquivos foram enviados com sucesso
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot pending">⏳</div>
            <div class="timeline-text">
              <strong>Verificação em andamento</strong><br>
              Nossa equipe está analisando suas informações
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot">○</div>
            <div class="timeline-text">
              <strong>Conta aprovada</strong><br>
              Você receberá um e-mail de confirmação
            </div>
          </div>
        </div>
        
        <div class="next-steps">
          <div class="next-steps-title">📌 O que esperar agora:</div>
          <p class="paragraph" style="font-size: 14px; margin: 0;">
            • Processo leva até <strong>24-48 horas</strong><br>
            • Notificação por e-mail ao finalizar<br>
            • Acesso completo à plataforma após aprovação
          </p>
        </div>
        
        <p class="paragraph" style="font-size: 14px;">
          Enquanto isso, explore nossa plataforma e descubre como impulsionar suas vendas!
        </p>
      </div>
      
      <div class="footer">
        <div class="support">
          Precisa de ajuda? <a href="mailto:suporte@culonga.com" class="contact-link">suporte@culonga.com</a>
        </div>
        <div class="copyright">
          © 2025 Culonga • Todos os direitos reservados
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
              to: User.email,
              subject: '📋 Verificação em Andamento - Culonga',
            });
            return {
              message: updated?.id
                ? 'Por favor aguarde a sua verificação'
                : 'Erro ao criar a verificação',
              created: updated?.id ? true : false,
            };
          }
            }catch(e){
              console.log(e)
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
          try{
          const email = new EmailService();
          await email.senEmail({
            subject: `🎯 ${mappedStatus == 'APROVED' ? 'Conta Aprovada - Bem-vindo à Culonga!' : 'Conta em Análise - Precisa de Ajustes'}`,
            html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${mappedStatus == 'APROVED' ? 'Conta Aprovada - Culonga' : 'Conta em Análise - Culonga'}</title>
  <style>
    :root {
      --success: #10B981;
      --success-light: #ECFDF5;
      --warning: #F59E0B;
      --warning-light: #FFFBEB;
      --primary: #7C3AED;
      --primary-dark: #6D28D9;
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --text: #1E293B;
      --text-muted: #64748B;
      --border: #E2E8F0;
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      background: var(--bg); 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      color: var(--text); 
      line-height: 1.6;
    }
    
    .wrapper { 
      padding: 40px 20px; 
    }
    
    .container { 
      max-width: 500px; 
      margin: 0 auto; 
      background: var(--card); 
      border-radius: 20px; 
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
      overflow: hidden;
      border: 1px solid var(--border);
    }
    
    .header { 
      padding: 30px; 
      background: linear-gradient(135deg, var(--primary), var(--primary-dark)); 
      color: white; 
      text-align: center; 
    }
    
    .logo { 
      font-size: 28px; 
      font-weight: 800; 
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
    }
    
    .content { 
      padding: 40px 30px; 
      text-align: center; 
    }
    
    .status-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 40px;
    }
    
    .approved {
      background: linear-gradient(135deg, var(--success), #059669);
    }
    
    .rejected {
      background: linear-gradient(135deg, var(--warning), #D97706);
    }
    
    .greeting {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .user-name {
      color: var(--primary);
    }
    
    .message-box {
      background: ${mappedStatus == 'APROVED' ? 'var(--success-light)' : 'var(--warning-light)'};
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      border-left: 4px solid ${mappedStatus == 'APROVED' ? 'var(--success)' : 'var(--warning)'};
      text-align: left;
    }
    
    .message-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: ${mappedStatus == 'APROVED' ? 'var(--success)' : 'var(--warning)'};
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .paragraph { 
      font-size: 16px; 
      color: var(--text-muted); 
      margin-bottom: 20px;
    }
    
    .next-steps {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    
    .next-steps-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--border);
    }
    
    .step:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .step-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .step-text {
      font-size: 14px;
      color: var(--text-muted);
    }
    
    .step-text strong {
      color: var(--text);
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white !important;
      padding: 14px 32px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
    }
    
    .support-section {
      background: #F0F9FF;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid var(--primary);
    }
    
    .support-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }
    
    .support-contact {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
      font-size: 15px;
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid var(--border);
    }
    
    .copyright {
      font-size: 12px;
      color: var(--text-muted);
      opacity: 0.7;
    }
    
    @media (max-width: 600px) {
      .wrapper { padding: 20px 16px; }
      .content { padding: 30px 20px; }
      .greeting { font-size: 22px; }
      .status-icon { width: 80px; height: 80px; font-size: 32px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Culonga</div>
        <div class="tagline">Sua plataforma de vendas digital</div>
      </div>
      
      <div class="content">
        <div class="status-icon ${mappedStatus == 'APROVED' ? 'approved' : 'rejected'}">
          ${mappedStatus == 'APROVED' ? '🎉' : '📝'}
        </div>
        
        <h1 class="greeting">
          ${mappedStatus == 'APROVED' ? 'Parabéns, <span class="user-name">' + updatedUser.name + ' ' + updatedUser.lastname + '</span>!' : 'Olá, <span class="user-name">' + updatedUser.name + ' ' + updatedUser.lastname + '</span>!'}
        </h1>
        
        <div class="message-box">
          <div class="message-title">
            ${mappedStatus == 'APROVED' ? '✅ Conta Aprovada' : '📋 Conta em Análise'}
          </div>
          <p class="paragraph">
            ${
              mappedStatus == 'APROVED'
                ? 'Sua conta de vendedor foi <strong>aprovada com sucesso</strong>! Agora você tem acesso completo à plataforma Culonga para começar a vender.'
                : 'Sua conta de vendedor <strong>precisa de ajustes</strong>. Nossa equipe identificou que alguns documentos necessitam de correção.'
            }
          </p>
        </div>
        
        <div class="next-steps">
          <div class="next-steps-title">🚀 ${mappedStatus == 'APROVED' ? 'Próximos Passos' : 'O que fazer agora?'}</div>
          
          ${
            mappedStatus == 'APROVED'
              ? `
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-text">
                <strong>Complete seu perfil</strong><br>
                Adicione foto e informações para construir confiança
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-text">
                <strong>Crie seu primeiro produto</strong><br>
                Comece a vender e gerar renda imediatamente
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-text">
                <strong>Configure métodos de pagamento</strong><br>
                Receba seus ganhos de forma segura
              </div>
            </div>
          `
              : `
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-text">
                <strong>Verifique os documentos enviados</strong><br>
                Certifique-se de que estão legíveis e completos
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-text">
                <strong>Reenvie os documentos corretos</strong><br>
                Fotos nítidas e informações atualizadas
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-text">
                <strong>Aguarde nova análise</strong><br>
                Revisaremos em até 24 horas após o reenvio
              </div>
            </div>
          `
          }
        </div>
        
        ${
          mappedStatus == 'APROVED'
            ? `
          <a href="https://app.culonga.com/dashboard" class="cta-button">
            🎯 Acessar Minha Conta
          </a>
        `
            : ''
        }
        
        <div class="support-section">
          <div class="support-title">💬 Precisa de ajuda?</div>
          <p class="paragraph" style="font-size: 14px; margin: 0;">
            Nossa equipe está aqui para te ajudar!<br>
            Entre em contato: <a href="mailto:suporte@culonga.com" class="support-contact">suporte@culonga.com</a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <div class="copyright">
          © 2025 Culonga • Transformando vendas digitais em Angola
        </div>
      </div>
    </div>
  </div>
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
            }catch(e){
              console.log(e)
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
