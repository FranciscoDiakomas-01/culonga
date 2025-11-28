import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaypayNotifyDto, updateManualy } from './dto/update-payment.dto';
import DatabaseService from 'src/services/database/database.service';
import PaymentCreater from './usecases/create';
import PaymentGetter from './usecases/get';
import PaymentUpdate from './usecases/update';
import { Status } from 'generated/prisma';
import EmailService from 'src/services/Email/email.service';
import ExuteMyWebhooks from 'src/modules/integrations/useCases/executeIntegrations';
import WebHookService from 'src/services/webhook/webhook.service';

@Injectable()
export class PaymentsService {
  private readonly pushKit = new WebHookService();
  constructor(private readonly database: DatabaseService) {}

  public async create(createPaymentDto: CreatePaymentDto) {
    const creater = new PaymentCreater(this.database);
    return await creater.create(createPaymentDto);
  }

  public async findAll(page: number = 1, userid: undefined | string) {
    const getter = new PaymentGetter(this.database);
    const [myPayments, stats] = await Promise.all([
      await getter.getPayments(userid, page),
      await getter.getPaymentsStats(userid),
    ]);
    return {
      data: myPayments,
      stats,
    };
  }
  public async getStats(userid: undefined | string) {
    const getter = new PaymentGetter(this.database);
    const myPayments = getter.getPaymentsStats(userid);
    return myPayments;
  }

  public async getPaymentsByStatus(
    userid: undefined | string,
    status: Status,
    page: number = 1,
  ) {
    const getter = new PaymentGetter(this.database);
    const myPayments = getter.getPaymentsByStatus(userid, page, status);
    return myPayments;
  }
  public async getbyInterval(userid: string, from: string, to: string) {
    const getter = new PaymentGetter(this.database);
    const myPayments = getter.getMyPaymentPerInterval(from, to, userid);
    return myPayments;
  }

  public async findOne(id: string) {
    const getter = new PaymentGetter(this.database);
    const myPayments = getter.getPaymentStatus(id);
    return myPayments;
  }
  public async update(updatePaymentDto: PaypayNotifyDto | any) {
    const updater = new PaymentUpdate(this.database);
    return await updater.update(updatePaymentDto);
  }

  public async updateManualy(data: updateManualy) {
    const [payment] = await Promise.all([
      this.database.payment.findFirst({
        where: {
          OR: [{ uuid: data.payid }, { paypayCode: data.payid }],
        },
        include: { User: true },
      }),
    ]);

    if (!payment || !payment.User) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (payment.status != 'PENDING') {
      throw new NotFoundException('Pagamento já foi modificado');
    }

    const [Product] = await Promise.all([
      this.database.products.findFirst({
        where: { id: payment.productId },
        include: { user: true },
      }),
    ]);

    if (!Product || !Product.user) return;

    const mappedStatus: Status = data.status == '1' ? 'APROVED' : 'CANCELED';

    await this.database.payment.update({
      data: { status: mappedStatus },
      where: { uuid: payment.uuid },
    });

    if (mappedStatus === 'APROVED') {
      const emailService = new EmailService();
      const user = JSON.parse(payment.user as string) as {
        name: string;
        email: string;
        telefone: string;
      };

      // 1️⃣ Calcula o valor líquido após taxa da plataforma
      const valorLiquido = this.percent(payment.amount);

      // 2️⃣ Verifica se há afiliado e divide
      const {
        amountToAfiliate,
        amountToUser,
        afiliateId,
        userAfiliationId,
        Afifiliate,
      } = await this.isAfiliatable(
        String(payment.afiliationcode),
        payment.productId,
        valorLiquido,
      );

      // 3️⃣ Atualiza saldo do afiliado
      if (afiliateId && userAfiliationId) {
        await Promise.all([
          this.database.users.update({
            data: {
              totalEarned: { increment: amountToAfiliate },
              availableBalance: { increment: amountToAfiliate },
            },
            where: { id: userAfiliationId },
          }),
          this.database.afiliates.update({
            data: { totalPurchases: { increment: amountToAfiliate } },
            where: { id: afiliateId },
          }),
          emailService.senEmail({
            to: Afifiliate.email,
            subject: '💰 Nova Comissão Recebida - Culonga',
            html: `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova Venda - Culonga</title>
  <style>
    body { background-color: #f9fafb; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .header { background-color: #10b981; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 25px; }
    .content h1 { font-size: 22px; color: #10b981; }
    .content p { font-size: 15px; line-height: 1.6; margin: 10px 0; }
    .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>💰 Nova Venda - Culonga</h2>
    </div>
    <div class="content">
      <h1>🎊 Parabéns! Você recebeu uma nova comissão!</h1>
      <p>Olá, ${Afifiliate.name},</p>
      <p>Seu produto afiliado foi vendido com sucesso. Aqui estão os detalhes:</p>
      
      <div class="info-box">

  <p><strong>Produto:</strong> ${Product?.title}</p>
  <p><strong>Valor da venda:</strong> ${amountToAfiliate.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
  <p><strong>Seu lucro:</strong> ${amountToAfiliate.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
  <p><strong>Comprador:</strong> ${user.name} (${user.email})</p>
  <p><strong>Data da venda:</strong> ${new Date().toLocaleString('pt-AO')}</p>

      </div>
      <p>Continue afiliando-se a produtos de qualidade para aumentar suas vendas! 🚀</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Culonga. Todos os direitos reservados.</p>
      <p>Esta é uma mensagem automática, por favor não responda.</p>
    </div>
  </div>
</body>
</html>`,
          }),
        ]);
      }

      await this.database.users.update({
        data: {
          totalEarned: { increment: amountToUser },
          availableBalance: { increment: amountToUser },
        },
        where: { id: payment.User.id },
      });

      await this.database.products.update({
        where: { id: payment.productId },
        data: { totalPurchase: { increment: canMark?.id == payment?.userid ? 0 :  payment.amount } },
      });

      await Promise.all([
        emailService.senEmail({
          to: user.email,
          subject: '✅ Compra Realizada',
          html: `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Compra Confirmada - Culonga</title>
    <style>
      body {
        background-color: #f9fafb;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
      }

      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .header {
        background-color: #1e3a8a;
        color: #fff;
        padding: 20px;
        text-align: center;
      }

      .content {
        padding: 25px;
      }

      .content h1 {
        font-size: 22px;
        color: #1e3a8a;
      }

      .content p {
        font-size: 15px;
        line-height: 1.6;
        margin: 10px 0;
      }

      .button {
        display: inline-block;
        background-color: #1e3a8a;
        color: #fff !important;
        padding: 12px 25px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-top: 15px;
      }

      .footer {
        background: #f3f4f6;
        padding: 15px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Culonga</h2>
      </div>

      <div class="content">
        <h1>🎉 Compra confirmada!</h1>
        <p>Olá, ${user.name || 'Caro cliente'},</p>
        <p>
          Agradecemos por comprar conosco! Seu pagamento foi confirmado e seu
          produto está pronto para acesso.
        </p>

        <p><strong>Produto:</strong> ${Product?.title}</p>

      <p>
       <strong>Suporte do vendedor</strong> ${Product?.whatsappSuport}
        </p>

        <p>Você pode acessar seu material clicando no botão abaixo:</p>

        <a
          href="${Product?.file}"
          target="_blank"
          class="button"
        >
          Acessar material
        </a>

        <p style="margin-top: 25px; font-size: 13px; color: #555;">
          Caso o botão acima não funcione, copie e cole o link abaixo no seu
          navegador:
          <br />
          <a href="${Product?.file}" target="_blank" style="color:#1e3a8a;">
            ${Product?.file}
          </a>
        </p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Culonga. Todos os direitos reservados.</p>
        <p>Esta é uma mensagem automática, por favor não responda.</p>
      </div>
    </div>
  </body>
</html>
`,
        }),
        emailService.senEmail({
          to: payment.User.email,
          subject: '💰 Nova Venda Realizada - Culonga',
          html: `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova Venda - Culonga</title>
  <style>
    body { background-color: #f9fafb; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .header { background-color: #10b981; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 25px; }
    .content h1 { font-size: 22px; color: #10b981; }
    .content p { font-size: 15px; line-height: 1.6; margin: 10px 0; }
    .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>💰 Nova Venda - Culonga</h2>
    </div>
    <div class="content">
      <h1>🎊 Parabéns! Você realizou uma nova venda!</h1>
      <p>Olá, ${payment.User.name},</p>
      <p>Seu produto foi vendido com sucesso. Aqui estão os detalhes:</p>
      
    <div class="info-box">
  <p><strong>Produto:</strong> ${Product?.title}</p>
  <p><strong>Valor da venda:</strong> ${amountToUser.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
  <p><strong>Seu lucro:</strong> ${amountToUser.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
  <p><strong>Comprador:</strong> ${user.name} (${user.email})</p>
  <p><strong>Data da venda:</strong> ${new Date().toLocaleString('pt-AO')}</p>
</div>

<p>O valor já foi creditado na sua conta Culonga e está disponível para saque.</p>

<p><strong>Saldo anterior:</strong> ${payment.User.availableBalance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
<p><strong>Novo saldo:</strong> ${(payment.User.availableBalance + amountToUser).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>

<p>Continue criando produtos de qualidade para aumentar suas vendas! 🚀</p>
</div>
<div class="footer">
  <p>© ${new Date().getFullYear()} Culonga. Todos os direitos reservados.</p>
  <p>Esta é uma mensagem automática, por favor não responda.</p>
</div>
  </div>
</body>
</html>`,
        }),
        
      ]);
      try {
        if (payment.coupun) {
          const couponData = JSON.parse(payment.coupun as any);
          if (couponData?.id) {
            await this.database.coupon.update({
              where: { id: couponData.id },
              data: { totalPurchased: { increment: payment.amount } },
            });
          }
        }
      } catch (error) {
        console.error(
          `Erro ao atualizar totalPurchased do cupom: ${error.message}`,
        );
      }
    }

    return {
      message: 'Pagamento modificado',
      product: Product,
      canMark: canMark?.id == payment?.userid,
    };
  }

  // Calcula valor líquido após taxa da plataforma
  private percent(montante: number): number {
    const taxaPlataforma = 0.08;
    const liquido = montante * (1 - taxaPlataforma);
    return Number(liquido.toFixed(2));
  }
// ✅ Dentro da classe
private async isAfiliatable(
  afiliationCode: string,
  productId: string,
  ammountRefined: number,
) {
  if (!afiliationCode) {
    return { amountToUser: ammountRefined, amountToAfiliate: 0 };
  }

  const canAFiliate = await this.database.afiliates.findFirst({
    where: { link: { endsWith: afiliationCode }, productId },
    include: { product: true, user: true },
  });

  if (!canAFiliate) {
    return { amountToUser: ammountRefined, amountToAfiliate: 0 };
  }

  const percentInAfiliation = canAFiliate.product.percentShare;
  const commissionAmount = (ammountRefined * percentInAfiliation) / 100;
  const amountToProductOwner = ammountRefined - commissionAmount;

  await Promise.all([
    this.database.afiliates.update({
      data: { totalSells: { increment: 1 } },
      where: { id: canAFiliate.id },
    }),
    this.database.users.update({
      data: { totalAfiliations: { increment: 1 } },
      where: { id: canAFiliate.userId },
    }),
  ]);

  return {
    amountToUser: amountToProductOwner,
    amountToAfiliate: commissionAmount,
    afiliateId: canAFiliate.id,
    userAfiliationId: canAFiliate.userId,
    Afifiliate: canAFiliate.user,
  };
}

}
