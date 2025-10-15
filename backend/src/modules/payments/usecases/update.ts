import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { PaypayNotifyDto } from '../dto/update-payment.dto';
import { Status } from 'generated/prisma';
import ExuteMyWebhooks from 'src/modules/integrations/useCases/executeIntegrations';
import WebHookService from 'src/services/webhook/webhook.service';
import EmailService from 'src/services/Email/email.service';
import MessagingService from 'src/services/Message/message.service';

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

          const Product = await this.database.products.findFirst({
            where: { id: payment.productId },
          });

          const emailService = new EmailService();
          const messagingService = new MessagingService();

          const valor = payment.amount;
          await Promise.all([
            emailService.senEmail({
              to: user.email,
              subject: '✅ Compra Realizada',
              html: `<h1>Compra confirmada</h1><p>Produto: ${Product?.title}</p>`,
            }),

            messagingService.sendMessage(
              user.telefone,
              Product?.file as string,
              Product?.whatsappSuport,
            ),

            this.database.users.update({
              data: {
                totalEarned: payment.User.totalEarned + valor,
                availableBalance:
                  payment.User.availableBalance + this.percent(valor),
              },
              where: { id: payment.User.id },
            }),
          ]);

          await Promise.all([
            this.pushKit.send(),
            ExuteMyWebhooks(payment.userid, this.database, payment.uuid),
          ]);

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
    const taxaPlataforma = 0.07;
    const liquido = montante * (1 - taxaPlataforma);
    return Number(liquido.toFixed(2));
  }
}
