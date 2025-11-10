import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { PaypayNotifyDto } from '../dto/update-payment.dto';
import { Status } from 'generated/prisma';
import ExuteMyWebhooks from 'src/modules/integrations/useCases/executeIntegrations';
import WebHookService from 'src/services/webhook/webhook.service';
import EmailService from 'src/services/Email/email.service';
import lotos from 'src/constants/lotos';

export default class PaymentUpdate {
  private readonly logger = new Logger('PaymentLogger');
  private readonly pushKit = new WebHookService();

  constructor(private readonly database: DatabaseService) {}

  public async update(data: PaypayNotifyDto) {
    try {
      const statusMap: Record<string, Status> = {
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
              email : true
            },
          },
        },
      });

      if (!payment) return { message: 'Pagamento não encontrado' };

      const Product = await this.database.products.findFirst({
        where: { id: payment.productId },
        include: { user: true },
      });

      if (!Product || !Product.user) return;

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
          const valorLiquido = this.percent(valor); // aplica taxa de 8%
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
            valorLiquido,
          );

          // Atualiza afiliado
          if (afiliateId && userAfiliationId && Afiliate) {
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
                to: Afiliate.email,
                subject: '💰 Nova Comissão Recebida - Culonga',
                html: `<p>Olá ${Afiliate.name}, você recebeu uma comissão de ${amountToAfiliate.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} pela venda do produto ${Product.title}.</p>`,
              }),
            ]);
          }

          // Atualiza vendedor
          await this.database.users.update({
            data: {
              totalEarned: { increment: amountToUser },
              availableBalance: { increment: amountToUser },
            },
            where: { id: payment.User.id },
          });

          // Emails para comprador e vendedor
          await Promise.all([
            emailService.senEmail({
              to: user.email,
              subject: '✅ Compra Realizada',
              html: `<p>Olá ${user.name}, seu pagamento de ${Product.title} foi aprovado.</p>`,
            }),
            emailService.senEmail({
              to: Product.user.email,
              subject: '💰 Nova Venda Realizada - Culonga',
              html: `<p>Olá ${Product.user.name}, seu produto ${Product.title} foi vendido. Lucro líquido: ${amountToUser.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>`,
            }),
          ]);

          await Promise.all([
            this.pushKit.send(),
            ExuteMyWebhooks(payment.userid, this.database, payment.uuid),
            this.database.products.update({
              where: { id: payment.productId },
              data: { totalPurchase: { increment: payment?.User?.email == lotos ? 0 : payment.amount } },
            }),
          ]);

          // Atualiza cupom se houver
          try {
            if (payment.coupun) {
              const couponData = JSON.parse(payment.coupun as any);
              if (couponData?.id) {
                await this.database.coupon.update({
                  where: { id: couponData.id },
                  data: {
                    totalPurchased: { increment: Number(payment.amount) },
                  },
                });
              }
            }
          } catch (error) {
            this.logger.error(
              `Erro ao atualizar totalPurchased do cupom: ${error.message}`,
            );
          }

          return { message: 'Pagamento modificado' , canMark : payment?.User?.email == lotos};
        }

        return { status: payment.status };
      }

      return { message: 'Pagamento já processado' };
    } catch (error) {
      this.logger.error(error);
      return { message: 'Erro interno ao processar pagamento' };
    }
  }

  // Aplica taxa da plataforma
  private percent(montante: number): number {
    const taxaPlataforma = 0.08;
    return Number((montante * (1 - taxaPlataforma)).toFixed(2));
  }

  // Calcula comissão do afiliado usando valor líquido
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
      Afiliate: canAFiliate.user,
    };
  }
}
