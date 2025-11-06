import { Logger } from '@nestjs/common';
import IsActiveUser from 'src/interceptors/isActiveUser';
import DatabaseService from 'src/services/database/database.service';
import { CreateTransactionDto } from '../dto/create-cash.dto';
import EmailService from 'src/services/Email/email.service';

export default class TransitionSetter {
  private readonly logger = new Logger('Transictoion');
  private readonly isACtive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isACtive = new IsActiveUser(this.database);
  }
  private email = new EmailService();
  public async createTransiaction(data: CreateTransactionDto) {
    try {
      const isActiveUser = await this.isACtive.isActive(data.userid);
      if (isActiveUser) {
        const User = await this.database.users.findUnique({
          where: {
            id: data.userid,
          },
        });
        if (!User || User?.status != 'APROVED') {
          return {
            message: 'Conta não não verificada',
          };
        }
        const totalSaques = await this.database.withdrawal.aggregate({
          where: {
            status: 'PENDING',
            userid: User.id,
          },
          _sum: {
            amount: true,
          },
        });

        const soma = totalSaques._sum.amount ?? 0;
        const admin = await this.database.users.findFirst({
          where: {
            role: 'ADMIN',
          },
        });

        if (User && User.availableBalance >= data.amount + soma) {
          const createdTransiction = await this.database.withdrawal.create({
            data: {
              ...data,
              status: 'PENDING',
            },
          });

          await Promise.all([
            this.email.senEmail({
              html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pedido de Saque - Culonga</title>
  <style>
    :root {
      --primary: #7C3AED;
      --primary-dark: #6D28D9;
      --success: #10B981;
      --warning: #F59E0B;
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --text: #1E293B;
      --text-muted: #64748B;
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      background: var(--bg); 
      font-family: 'Inter', -apple-system, sans-serif; 
      color: var(--text); 
      line-height: 1.6;
    }
    
    .container { 
      max-width: 500px; 
      margin: 40px auto; 
      background: var(--card); 
      border-radius: 20px; 
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
      overflow: hidden;
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
    
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--text);
    }
    
    .info-box {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
      border-left: 4px solid var(--primary);
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: var(--text-muted);
    }
    
    .info-value {
      font-weight: 700;
      color: var(--text);
    }
    
    .status-pending {
      background: #FFFBEB;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid var(--warning);
      text-align: center;
    }
    
    .status-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #D97706;
    }
    
    .next-steps {
      background: #F0F9FF;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid var(--primary);
    }
    
    .steps-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text);
    }
    
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .step-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .step-text {
      font-size: 14px;
      color: var(--text-muted);
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      color: var(--text-muted);
      font-size: 12px;
    }
    
    @media (max-width: 600px) {
      .container { margin: 20px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💰 Culonga</div>
      <div>Sua plataforma de vendas digital</div>
    </div>
    
    <div class="content">
      <div class="icon">⏳</div>
      
      <h1 class="title">Pedido de Saque Recebido!</h1>
      
      <p>Olá, <strong>${User.name}</strong>!</p>
      <p>Recebemos seu pedido de saque e ele está em processamento.</p>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor do Saque:</span>
          <span class="info-value">${data.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">Banco:</span>
          <span class="info-value">${data.bank}</span>
        </div>
        <div class="info-item">
          <span class="info-label">IBAN:</span>
          <span class="info-value">${data.iban}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data do Pedido:</span>
          <span class="info-value">${new Date().toLocaleDateString('pt-AO')}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Saldo Disponível:</span>
          <span class="info-value">${User.availableBalance.toLocaleString('pt-AO')} kz</span>
        </div>
      </div>
      
      <div class="status-pending">
        <div class="status-title">📋 Status: Em Análise</div>
        <p>Seu pedido está sendo analisado pela nossa equipe. O processamento leva até 24-48 horas.</p>
      </div>
      
      <div class="next-steps">
        <div class="steps-title">🚀 Próximos Passos:</div>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">
            <strong>Análise da equipe</strong><br>
            Verificamos seus dados bancários
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">
            <strong>Processamento</strong><br>
            Transferência para sua conta
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">
            <strong>Confirmação</strong><br>
            Você receberá um email de confirmação
          </div>
        </div>
      </div>
      
      <p style="font-size: 14px; color: var(--text-muted); margin-top: 20px;">
        Dúvidas? Entre em contato: <a href="mailto:suporte@culonga.com" style="color: var(--primary);">suporte@culonga.com</a>
      </p>
    </div>
    
    <div class="footer">
      <div>© ${new Date().getFullYear()} Culonga • Todos os direitos reservados</div>
      <div style="margin-top: 8px; opacity: 0.7;">
        Este é um email automático, por favor não responda.
      </div>
    </div>
  </div>
</body>
</html>`,
              subject: '💰 Pedido de Saque Recebido - Culonga',
              to: User.email,
            }),
            this.email.senEmail({
              subject: '💰 Novo Pedido de Saque - Culonga',
              to: admin?.email as string,
              html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Pedido de Saque - Culonga</title>
  <style>
    :root {
      --primary: #7C3AED;
      --warning: #F59E0B;
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --text: #1E293B;
      --text-muted: #64748B;
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      background: var(--bg); 
      font-family: 'Inter', sans-serif; 
      color: var(--text); 
      line-height: 1.6;
    }
    
    .container { 
      max-width: 500px; 
      margin: 40px auto; 
      background: var(--card); 
      border-radius: 20px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.05); 
      overflow: hidden;
    }
    
    .header { 
      padding: 30px; 
      background: linear-gradient(135deg, var(--warning), #D97706); 
      color: white; 
      text-align: center; 
    }
    
    .logo { 
      font-size: 28px; 
      font-weight: 800; 
      margin-bottom: 8px;
    }
    
    .content { 
      padding: 40px 30px; 
      text-align: center; 
    }
    
    .icon {
      width: 80px;
      height: 80px;
      background: #FFFBEB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 32px;
      border: 3px solid var(--warning);
      color: var(--warning);
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--warning);
    }
    
    .alert-box {
      background: #FFFBEB;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid var(--warning);
    }
    
    .alert-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #D97706;
    }
    
    .info-box {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
      border-left: 4px solid var(--primary);
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: var(--text-muted);
    }
    
    .info-value {
      font-weight: 700;
      color: var(--text);
    }
    
    .user-info {
      background: #F0F9FF;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: left;
      border-left: 4px solid #0EA5E9;
    }
    
    .user-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #0EA5E9;
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin: 25px 0;
    }
    
    .btn {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }
    
    .btn-approve {
      background: var(--primary);
      color: white;
    }
    
    .btn-reject {
      background: #EF4444;
      color: white;
    }
    
    .btn-dashboard {
      background: #6B7280;
      color: white;
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      color: var(--text-muted);
      font-size: 12px;
    }
    
    @media (max-width: 600px) {
      .container { margin: 20px; }
      .content { padding: 30px 20px; }
      .action-buttons { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💰 Culonga</div>
      <div>Novo Pedido de Saque</div>
    </div>
    
    <div class="content">
      <div class="icon">📥</div>
      
      <h1 class="title">Novo Pedido de Saque Recebido</h1>
      
      <div class="alert-box">
        <div class="alert-title">⏰ Ação Requerida</div>
        <p>Um usuário solicitou um saque. Por favor, analise e aprove ou rejeite o pedido.</p>
      </div>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor do Saque:</span>
          <span class="info-value">${data.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">Banco:</span>
          <span class="info-value">${data.bank}</span>
        </div>
        <div class="info-item">
          <span class="info-label">IBAN:</span>
          <span class="info-value">${data.iban}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data do Pedido:</span>
          <span class="info-value">${new Date().toLocaleDateString('pt-AO')}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ID do Saque:</span>
          <span class="info-value" style="font-size: 12px;">${createdTransiction.id}</span>
        </div>
      </div>
      
      <div class="user-info">
        <div class="user-title">👤 Informações do Usuário</div>
        <div class="info-item">
          <span class="info-label">Nome:</span>
          <span class="info-value">${User.name} ${User.lastname}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">${User.email}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Saldo Disponível:</span>
          <span class="info-value">${User.availableBalance.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total Ganho:</span>
          <span class="info-value">${User.totalEarned.toLocaleString('pt-AO')} kz</span>
        </div>
      </div>

      <div class="action-buttons">
        <a href="https://app.culonga.com/dashboard/bank" class="btn btn-dashboard">
          📊 Ver no Painel
        </a>
      </div>
      
      <p style="font-size: 14px; color: var(--text-muted);">
        Acesse o painel administrativo para analisar e processar este pedido.
      </p>
    </div>
    
    <div class="footer">
      <div>© ${new Date().getFullYear()} Culonga • Sistema Automático</div>
      <div style="margin-top: 8px; opacity: 0.7;">
        Este é um email automático de notificação.
      </div>
    </div>
  </div>
</body>
</html>`,
            }),
          ]);
          return {
            message: createdTransiction?.id
              ? 'Pedido de saque criado'
              : 'Erro ao criar',
            created: createdTransiction?.id ? true : false,
          };
        }
        return {
          message: `Saldo insuficiente`,
        };
      }
      return {
        message: 'A sua conta deve ser verificada',
      };
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao buscar o produto');
      return {
        message: 'Produto não encontrado',
      };
    }
  }
}
