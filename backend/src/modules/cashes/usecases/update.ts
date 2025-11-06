import DatabaseService from 'src/services/database/database.service';
import EmailService from 'src/services/Email/email.service';

export default async function AproveWidrall(
  id: string,
  database: DatabaseService,
  status: '1' | '0',
  file: string,
) {
  try {
    const Withdrawal = await database.withdrawal.findUnique({
      where: {
        id,
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
            availableBalance: true,
            totalEarned: true,
          },
        },
        id: true,
        bank: true,
        amount: true,
        status: true,
        iban: true,
        createdAt: true,
      },
    });

    if (!Withdrawal) {
      return {
        sent: false,
        message: 'Pedido de saque não encontrado',
      };
    }

    if (status == '0') {
      // 🔥 SAQUE REJEITADO
      await database.withdrawal.update({
        data: {
          status: 'REJECTED',
          fileURL: '',
        },
        where: {
          id: Withdrawal.id,
        },
      });

      // 📧 EMAIL DE REJEIÇÃO
      await new EmailService().senEmail({
        to: Withdrawal.user.email,
        subject: '❌ Saque Rejeitado - Culonga',
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Saque Rejeitado - Culonga</title>
  <style>
    :root {
      --error: #EF4444;
      --primary: #7C3AED;
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
      background: linear-gradient(135deg, var(--error), #DC2626); 
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
      background: #FEF2F2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 32px;
      border: 3px solid var(--error);
      color: var(--error);
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--error);
    }
    
    .info-box {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
      border-left: 4px solid var(--error);
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
    
    .message-box {
      background: #FEF2F2;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid var(--error);
    }
    
    .message-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--error);
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
    
    .support {
      background: #FFFBEB;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid #F59E0B;
    }
    
    .support-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #D97706;
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">❌ Culonga</div>
      <div>Notificação de Saque</div>
    </div>
    
    <div class="content">
      <div class="icon">❌</div>
      
      <h1 class="title">Saque Rejeitado</h1>
      
      <p>Olá, <strong>${Withdrawal.user.name} ${Withdrawal.user.lastname}</strong>!</p>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor do Saque:</span>
          <span class="info-value">${Withdrawal.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">Banco:</span>
          <span class="info-value">${Withdrawal.bank}</span>
        </div>
        <div class="info-item">
          <span class="info-label">IBAN:</span>
          <span class="info-value">${Withdrawal.iban}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data do Pedido:</span>
          <span class="info-value">${new Date(Withdrawal.createdAt).toLocaleDateString('pt-AO')}</span>
        </div>
      </div>
      
      <div class="message-box">
        <div class="message-title">📝 Motivo da Rejeição</div>
        <p>Seu pedido de saque não atendeu aos requisitos da nossa política. Verifique seus dados bancários e tente novamente.</p>
      </div>
      
      <div class="next-steps">
        <div class="steps-title">🔄 O que fazer agora?</div>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">
            <strong>Verifique seus dados bancários</strong><br>
            Confirme se o IBAN e banco estão corretos
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">
            <strong>Faça um novo pedido</strong><br>
            Corrija os dados e solicite novamente
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">
            <strong>Aguarde nova análise</strong><br>
            Processaremos em até 24 horas
          </div>
        </div>
      </div>
      
      <div class="support">
        <div class="support-title">💬 Precisa de ajuda?</div>
        <p style="margin: 0; font-size: 14px;">
          Entre em contato com nosso suporte:<br>
          <a href="mailto:suporte@culonga.com" style="color: #D97706; font-weight: 500;">
            suporte@culonga.com
          </a>
        </p>
      </div>
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
      });

      return {
        sent: true,
        message: 'Saque rejeitado',
      };
    } else {
      // 🔥 SAQUE APROVADO
      const [updatedWithdrawal, updatedUser] = await Promise.all([
        database.withdrawal.update({
          data: {
            fileURL: file,
            status: 'APROVED',
          },
          where: {
            id: Withdrawal.id,
          },
        }),
        database.users.update({
          data: {
            availableBalance:
              Withdrawal.user.availableBalance - Withdrawal.amount,
            withdrawnAmount: { increment: Withdrawal.amount },
          },
          where: {
            id: Withdrawal.user.id,
          },
        }),
      ]);

      // 📧 EMAIL DE APROVAÇÃO
      await new EmailService().senEmail({
        to: updatedUser.email,
        subject: '✅ Saque Aprovado - Culonga',
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Saque Aprovado - Culonga</title>
  <style>
    :root {
      --success: #10B981;
      --primary: #7C3AED;
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
      background: linear-gradient(135deg, var(--success), #059669); 
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
      background: #ECFDF5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 32px;
      border: 3px solid var(--success);
      color: var(--success);
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--success);
    }
    
    .info-box {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
      border-left: 4px solid var(--success);
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
    
    .success-box {
      background: #ECFDF5;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid var(--success);
    }
    
    .success-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--success);
    }
    
    .timeframe {
      background: #F0F9FF;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid var(--primary);
    }
    
    .timeframe-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✅ Culonga</div>
      <div>Confirmação de Saque</div>
    </div>
    
    <div class="content">
      <div class="icon">✅</div>
      
      <h1 class="title">Saque Aprovado!</h1>
      
      <p>Olá, <strong>${updatedUser.name} ${updatedUser.lastname}</strong>!</p>
      <p>Seu saque foi processado com sucesso e o valor será transferido para sua conta.</p>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor do Saque:</span>
          <span class="info-value">${Withdrawal.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">Banco Destino:</span>
          <span class="info-value">${Withdrawal.bank}</span>
        </div>
        <div class="info-item">
          <span class="info-label">IBAN:</span>
          <span class="info-value">${Withdrawal.iban}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data da Aprovação:</span>
          <span class="info-value">${new Date().toLocaleDateString('pt-AO')}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ID do Saque:</span>
          <span class="info-value" style="font-size: 12px;">${Withdrawal.id}</span>
        </div>
      </div>
      
      <div class="success-box">
        <div class="success-title">🎉 Transferência em Processo</div>
        <p>O valor já foi debitado da sua conta Culonga e está sendo transferido para seu banco.</p>
      </div>
      
      <div class="timeframe">
        <div class="timeframe-title">⏱️ Prazo de Transferência</div>
        <p>O valor chegará na sua conta em <strong>até 2 dias úteis</strong>, dependendo do seu banco.</p>
      </div>
      
      <p style="font-size: 14px; color: var(--text-muted); margin-top: 20px;">
        Dúvidas? <a href="mailto:suporte@culonga.com" style="color: var(--primary); font-weight: 500;">suporte@culonga.com</a>
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
      });

      return {
        sent: true,
        message: 'Saque aprovado',
      };
    }
  } catch (error) {
    return {
      sent: false,
      message: 'Erro ao processar saque',
    };
  }
}
