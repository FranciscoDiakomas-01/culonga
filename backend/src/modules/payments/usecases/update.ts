import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { PaypayNotifyDto } from '../dto/update-payment.dto';
import { Status } from 'generated/prisma';
import ExuteMyWebhooks from 'src/modules/integrations/useCases/executeIntegrations';
import WebHookService from 'src/services/webhook/webhook.service';
import EmailService from 'src/services/Email/email.service';

export default class PaymentUpdate {
  private readonly logger = new Logger('PaymentLogger');
  private readonly pushKit = new WebHookService();

  constructor(private readonly database: DatabaseService) {}

  public async update(data: PaypayNotifyDto) {
    try {
      const statusMap: Record<
        string,
        'PENDING' | 'APROVED' | 'REJECTED' | 'CANCELED'
      > = {
        TRADE_SUCCESS: 'APROVED',
        TRADE_FINISHED: 'APROVED',
        REFUND_SUCCESS: 'APROVED',
        TRANSFER_SUCCESS: 'APROVED',
        TRADE_CLOSED: 'CANCELED',
        REFUND_FAIL: 'CANCELED',
        TRANSFER_FAIL: 'REJECTED',
      };

      function mapPaypayStatus(paypayStatus: string): Status {
        return statusMap[paypayStatus] ?? 'PENDING';
      }

      const payment = await this.database.payment.findFirst({
        where: { paypayCode: data.out_trade_no },
        select: {
          status: true,
          user: true,
          userid: true,
          products: true,
          productId: true,
          amount: true,
          uuid: true,
          coupun: true,
          afiliationcode: true,
          afiliationused: true,
          User: {
            select: {
              id: true,
              availableBalance: true,
              totalEarned: true,
            },
          },
        },
      });

      if (!payment) {
        return { message: 'Pagamento não encontrado' };
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

      if (payment.status === 'PENDING') {
        const status = mapPaypayStatus(data.status);

        await this.database.payment.update({
          data: { status },
          where: { paypayCode: data.out_trade_no },
        });

        if (status === 'APROVED') {
          const user = JSON.parse(payment.user as string) as {
            name: string;
            email: string;
            telefone: string;
          };

          const valor = payment.amount;
          const emailService = new EmailService();
          const {
            amountToAfiliate,
            amountToUser,
            afiliateId,
            userAfiliationId,
            Afiliate,
          } = await this.isAfiliatable(
            String(payment.afiliationcode),
            payment.productId,
            this.percent(valor),
          );
          if (afiliateId && userAfiliationId && Afiliate) {
            await Promise.all([
              this.database.users.update({
                data: {
                  totalEarned: {
                    increment: amountToAfiliate,
                  },
                  availableBalance: {
                    increment: amountToAfiliate,
                  },
                },
                where: { id: userAfiliationId },
              }),
              this.database.afiliates.update({
                data: {
                  totalPurchases: {
                    increment: amountToAfiliate,
                  },
                },
                where: { id: afiliateId },
              }),
              emailService.senEmail({
                to: Afiliate.email,
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
      <p>Olá, ${Afiliate.name},</p>
      <p>Seu produto afiliado foi vendido com sucesso. Aqui estão os detalhes:</p>
      
      <div class="info-box">

  <p><strong>Produto:</strong> ${Product?.title}</p>
  <p><strong>Valor da venda:</strong> ${valor.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
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
        padding: 12pximport default from '../../../constants/default.checkout';
 25px;
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
            this.database.users.update({
              data: {
                totalEarned: {
                  increment: valor,
                },
                availableBalance: {
                  increment: amountToUser,
                },
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
            this.logger.error(
              `Erro ao atualizar totalPurchased do cupom: ${error.message}`,
            );
          }

          return { message: 'Pagamento modificado' };
        }
        return {
          status: payment.status,
        };
      }

      return { message: 'Pagamento já processado' };
    } catch (error) {
      this.logger.error(error);
      return { message: 'Erro interno ao processar pagamento' };
    }
  }

  private percent(montante: number): number {
    const taxaPlataforma = 0.08;
    const liquido = montante * (1 - taxaPlataforma);
    return Number(liquido.toFixed(2));
  }

  private async isAfiliatable(
    afiliationCode: string,
    productId: string,
    ammountRefined: number,
  ) {
    if (!afiliationCode) {
      return {
        amountToUser: ammountRefined,
        amountToAfiliate: 0,
      };
    }
    const canAFiliate = await this.database.afiliates.findFirst({
      where: {
        link: {
          endsWith: afiliationCode,
        },
        productId,
      },
      include: {
        product: true,
        user: true,
      },
    });

    if (!canAFiliate) {
      return {
        amountToUser: ammountRefined,
        amountToAfiliate: 0,
      };
    }
    const { product } = canAFiliate;
    const percentInAfiliation = canAFiliate.product.percentShare;
    const commissionAmount = (product.price * percentInAfiliation) / 100;
    const amountToProductOwner = ammountRefined - commissionAmount;
    await Promise.all([
      this.database.afiliates.update({
        data: {
          totalSells: {
            increment: 1,
          },
        },
        where: {
          id: canAFiliate?.id,
        },
      }),
      this.database.users.update({
        data: {
          totalAfiliations: {
            increment: 1,
          },
        },
        where: {
          id: canAFiliate.userId,
        },
      }),
    ]);
    return {
      amountToUser: amountToProductOwner,
      amountToAfiliate: commissionAmount,
      afiliateId: canAFiliate.id,
      userAfiliationId: canAFiliate.userId,
      Afiliate: canAFiliate.user,
    };
  }
}
