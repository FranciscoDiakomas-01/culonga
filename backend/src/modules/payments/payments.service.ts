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
import lotos from 'src/constants/lotos';

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
    let canMark = true;
    const [payment] = await Promise.all([
      this.database.payment.findFirst({
        where: {
          OR: [
            {
              uuid: data.payid,
            },
            {
              paypayCode: data.payid,
            },
          ],
        },
        include: {
          User: true,
        },
      }),
    ]);

    if (!payment || !payment.User) {
      throw new NotFoundException('Produto não encontrado');
    }
    if (payment.status != 'PENDING') {
      throw new NotFoundException('Pagamento já foi modificado');
    }
    const Product = await this.database.products.findFirst({
      where: { id: payment.productId },
      include: {
        user: true,
      },
    });

    if (!Product || !Product?.user) {
      return;
    }
    console.log(Product?.user);

    if (Product && Product?.price != payment.amount) {
      await this.database.payment.update({
        data: { status: 'CANCELED' },
        where: { uuid: payment.uuid },
      });
      throw new BadRequestException({
        message: 'O cliente não pagou o valor esperado ',
        description: `Valor do Produto ${Product.price?.toLocaleString('pt')} kz , valor pago pelo cliente ${payment.amount.toLocaleString('pt')} kz`,
      });
    }
    const mappedStatus: Status = data.status == '1' ? 'APROVED' : 'CANCELED';
    await this.database.payment.update({
      data: { status: mappedStatus },
      where: { uuid: payment.uuid },
    });
    if (mappedStatus == 'APROVED') {
      const emailService = new EmailService();
      const user = JSON.parse(payment.user as string) as {
        name: string;
        email: string;
        telefone: string;
      };
      const valor = payment.amount;
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
          to: Product.user.email,
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
      <p>Olá, ${Product.user.name},</p>
      <p>Seu produto foi vendido com sucesso. Aqui estão os detalhes:</p>
      
    <div class="info-box">
  <p><strong>Produto:</strong> ${Product?.title}</p>
  <p><strong>Valor da venda:</strong> ${valor.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
  <p><strong>Seu lucro:</strong> ${this.percent(valor).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
  <p><strong>Comprador:</strong> ${user.name} (${user.email})</p>
  <p><strong>Data da venda:</strong> ${new Date().toLocaleString('pt-AO')}</p>
</div>

<p>O valor já foi creditado na sua conta Culonga e está disponível para saque.</p>

<p><strong>Saldo anterior:</strong> ${payment.User.availableBalance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
<p><strong>Novo saldo:</strong> ${(payment.User.availableBalance + this.percent(valor)).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>

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
        this.database.users.update({
          data: {
            totalEarned: payment.User.totalEarned + valor,
            availableBalance:
              payment.User.availableBalance + this.percent(valor),
          },
          where: { id: payment.User.id },
        }),
        this.pushKit.send(),
        ExuteMyWebhooks(payment.userid, this.database, payment.uuid),
        this.database.products.update({
          where: {
            id: payment.productId,
          },
          data: {
            totalPurchase: {
              increment: payment.amount,
            },
          },
        }),
      ]);

      try {
        if (payment?.coupun) {
          const couponData = JSON.parse(payment.coupun as any);
          if (couponData?.id) {
            const amount = Number(payment.amount) || 0;
            await this.database.coupon.update({
              where: { id: couponData.id },
              data: {
                totalPurchased: { increment: amount },
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `Erro ao atualizar totalPurchased do cupom: ${error.message}`,
        );
      }
    }
    return { message: 'Pagamento modificado', product: Product, canMark: true };
  }

  private percent(montante: number): number {
    const taxaPlataforma = 0.08;
    const liquido = montante * (1 - taxaPlataforma);
    return Number(liquido.toFixed(2));
  }
}
