import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import DatabaseService from 'src/services/database/database.service';
import EmailService from 'src/services/Email/email.service';

@Injectable()
export class TransferService {
  constructor(private readonly database: DatabaseService) {}
  private readonly email = new EmailService();

  public async create(createTransferDto: CreateTransferDto, userId: string) {
    const [userFrom, userTo, admin] = await Promise.all([
      this.database.users.findUnique({
        where: { id: userId },
      }),
      this.database.users.findFirst({
        where: { email: createTransferDto.to },
      }),
      this.database.users.findFirst({
        where: { role: 'ADMIN' },
      }),
    ]);

    if (!userFrom) {
      throw new NotFoundException('Conta remetente não encontrada.');
    }

    if (!userTo) {
      throw new NotFoundException('Destinatário não encontrado.');
    }

    if (userFrom.id === userTo.id) {
      throw new BadRequestException('Você não pode transferir para si mesmo.');
    }

    if (createTransferDto.amount <= 0) {
      throw new BadRequestException(
        'O valor da transferência deve ser positivo.',
      );
    }

    if (userFrom.availableBalance < createTransferDto.amount) {
      throw new BadRequestException('Saldo insuficiente.');
    }
    const [updatedSender, updatedReceiver, transfer] = await Promise.all([
      this.database.users.update({
        where: { id: userFrom.id },
        data: {
          availableBalance: {
            decrement: createTransferDto.amount,
          },
          totalTranfered: {
            increment: createTransferDto.amount,
          },
        },
      }),

      this.database.users.update({
        where: { id: userTo.id },
        data: {
          availableBalance: {
            increment: createTransferDto.amount,
          },
          totatReciev: {
            increment: createTransferDto.amount,
          },
          totalEarned: {
            increment: createTransferDto.amount,
          },
        },
      }),

      this.database.transfer.create({
        data: {
          amount: createTransferDto.amount,
          type: 'EXTERNAL',
          fromId: userFrom.id,
          toId: userTo.id,
          status: 'APROVED',
        },
      }),

      this.email.senEmail({
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transferência Enviada - Culonga</title>
  <style>
    :root { --primary: #7C3AED; --success: #10B981; --bg: #F8FAFC; --card: #FFFFFF; --text: #1E293B; }
    body { margin: 0; padding: 0; background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); line-height: 1.6; }
    .container { max-width: 500px; margin: 40px auto; background: var(--card); border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
    .header { padding: 30px; background: linear-gradient(135deg, var(--primary), #6D28D9); color: white; text-align: center; }
    .content { padding: 40px 30px; text-align: center; }
    .icon { width: 80px; height: 80px; background: #ECFDF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; font-size: 32px; border: 3px solid var(--success); color: var(--success); }
    .info-box { background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left; border-left: 4px solid var(--primary); }
    .info-item { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E2E8F0; }
    .info-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .info-label { font-weight: 600; color: #64748B; }
    .info-value { font-weight: 700; color: var(--text); }
    .footer { padding: 25px; text-align: center; background: #F8FAFC; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 28px; font-weight: 800;">💸 Culonga</div>
      <div>Transferência Enviada</div>
    </div>
    <div class="content">
      <div class="icon">📤</div>
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: var(--success);">Transferência Realizada!</h1>
      <p>Olá, <strong>${userFrom.name}</strong>! Sua transferência foi processada com sucesso.</p>
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor Enviado:</span>
          <span class="info-value">${createTransferDto.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">Para:</span>
          <span class="info-value">${userTo.name} (${userTo.email})</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data:</span>
          <span class="info-value">${new Date().toLocaleDateString('pt-AO')}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Novo Saldo:</span>
          <span class="info-value">${(userFrom.availableBalance - createTransferDto.amount).toLocaleString('pt-AO')} kz</span>
        </div>
      </div>
      <p style="font-size: 14px; color: #64748B;">O valor foi debitado da sua conta e creditado ao destinatário.</p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} Culonga • Todos os direitos reservados</div>
    </div>
  </div>
</body>
</html>`,
        subject: '📤 Transferência Enviada - Culonga',
        to: userFrom.email,
      }),

      // 📧 EMAIL PARA O DESTINATÁRIO (quem recebeu)
      this.email.senEmail({
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transferência Recebida - Culonga</title>
  <style>
    :root { --primary: #7C3AED; --success: #10B981; --bg: #F8FAFC; --card: #FFFFFF; --text: #1E293B; }
    body { margin: 0; padding: 0; background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); line-height: 1.6; }
    .container { max-width: 500px; margin: 40px auto; background: var(--card); border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
    .header { padding: 30px; background: linear-gradient(135deg, var(--success), #059669); color: white; text-align: center; }
    .content { padding: 40px 30px; text-align: center; }
    .icon { width: 80px; height: 80px; background: #ECFDF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; font-size: 32px; border: 3px solid var(--success); color: var(--success); }
    .info-box { background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left; border-left: 4px solid var(--success); }
    .info-item { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E2E8F0; }
    .info-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .info-label { font-weight: 600; color: #64748B; }
    .info-value { font-weight: 700; color: var(--text); }
    .footer { padding: 25px; text-align: center; background: #F8FAFC; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 28px; font-weight: 800;">💰 Culonga</div>
      <div>Transferência Recebida</div>
    </div>
    <div class="content">
      <div class="icon">📥</div>
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: var(--success);">Você Recebeu uma Transferência!</h1>
      <p>Olá, <strong>${userTo.name}</strong>! Você recebeu uma transferência na sua conta.</p>
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor Recebido:</span>
          <span class="info-value">${createTransferDto.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">De:</span>
          <span class="info-value">${userFrom.name} (${userFrom.email})</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data:</span>
          <span class="info-value">${new Date().toLocaleDateString('pt-AO')}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Novo Saldo:</span>
          <span class="info-value">${(userTo.availableBalance + createTransferDto.amount).toLocaleString('pt-AO')} kz</span>
        </div>
      </div>
      <p style="font-size: 14px; color: #64748B;">O valor já está disponível na sua conta para uso.</p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} Culonga • Todos os direitos reservados</div>
    </div>
  </div>
</body>
</html>`,
        subject: '📥 Transferência Recebida - Culonga',
        to: userTo.email,
      }),

      // 📧 EMAIL PARA O ADMIN (notificação)
      this.email.senEmail({
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova Transferência - Culonga</title>
  <style>
    :root { --primary: #7C3AED; --warning: #F59E0B; --bg: #F8FAFC; --card: #FFFFFF; --text: #1E293B; }
    body { margin: 0; padding: 0; background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); line-height: 1.6; }
    .container { max-width: 500px; margin: 40px auto; background: var(--card); border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
    .header { padding: 30px; background: linear-gradient(135deg, var(--warning), #D97706); color: white; text-align: center; }
    .content { padding: 40px 30px; text-align: center; }
    .icon { width: 80px; height: 80px; background: #FFFBEB; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; font-size: 32px; border: 3px solid var(--warning); color: var(--warning); }
    .info-box { background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left; border-left: 4px solid var(--primary); }
    .info-item { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E2E8F0; }
    .info-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .info-label { font-weight: 600; color: #64748B; }
    .info-value { font-weight: 700; color: var(--text); }
    .footer { padding: 25px; text-align: center; background: #F8FAFC; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 28px; font-weight: 800;">🔔 Culonga</div>
      <div>Nova Transferência Realizada</div>
    </div>
    <div class="content">
      <div class="icon">💸</div>
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: var(--warning);">Nova Transferência no Sistema</h1>
      <p>Uma nova transferência foi realizada entre usuários.</p>
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Valor:</span>
          <span class="info-value">${createTransferDto.amount.toLocaleString('pt-AO')} kz</span>
        </div>
        <div class="info-item">
          <span class="info-label">De:</span>
          <span class="info-value">${userFrom.name} (${userFrom.email})</span>
        </div>
        <div class="info-item">
          <span class="info-label">Para:</span>
          <span class="info-value">${userTo.name} (${userTo.email})</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data:</span>
          <span class="info-value">${new Date().toLocaleDateString('pt-AO')}</span>
        </div>
      </div>
      <p style="font-size: 14px; color: #64748B;">Transferência processada automaticamente pelo sistema.</p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} Culonga • Sistema Automático</div>
    </div>
  </div>
</body>
</html>`,
        subject: '🔔 Nova Transferência Realizada - Culonga',
        to: admin?.email as string,
      }),
    ]);

    return {
      created: true,
      message: 'Transferência realizada com sucesso.',
      transfer,
    };
  }

  public async getAllMyTransfer(userId: string, page = 1) {
    const limit = 20;
    const user = await this.database.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const skip = (page - 1) * limit;

    const [total, transfers] = await Promise.all([
      this.database.transfer.count({
        where: {
          OR: [{ fromId: userId }, { toId: userId }],
        },
      }),
      this.database.transfer.findMany({
        where: {
          OR: [{ fromId: userId }, { toId: userId }],
        },
        include: {
          fromUser: {
            select: { id: true, name: true, email: true },
          },
          toUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Transferências encontradas com sucesso.',
      page,
      lastPage,
      data: transfers,
      stats: {
        recived: user.totatReciev,
        transfered: user.totalTranfered,
        avaliable: user.availableBalance,
      },
    };
  }
  public async getAllTrasnfers(page: number) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const [total, transfers] = await Promise.all([
      this.database.transfer.count({}),
      this.database.transfer.findMany({
        include: {
          fromUser: {
            select: { id: true, name: true, email: true },
          },
          toUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      message: 'Transferências encontradas com sucesso.',
      page,
      limit,
      total,
      totalPages,
      transfers,
    };
  }
}
