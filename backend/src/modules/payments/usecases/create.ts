import { PayPayService } from './../services/createpayment.service';
import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import PriceVerifier from '../services/price.service';

export default class PaymentCreater {
  private readonly logger = new Logger('Payment');
  private payService = new PayPayService();

  constructor(private readonly database: DatabaseService) {}

  public async create(data: CreatePaymentDto) {
    try {
      const isValidPrice = new PriceVerifier(this.database);
      const res = await isValidPrice.verify(
        data.orderbumps,
        data.amount,
        data.productId,
      );
      if (res.status) {
        const payments = await this.database.payment.create({
          data: {
            status: 'PENDING',
            method: data.method == 1 ? 'EXPRESS' : data.method == 2 ? "PAYPAY" : 'REFERENCE',
            user: JSON.stringify({
              name: data.name,
              email: data.email,
              telefone: data.tel,
            }),
            amount: res.price,
            orderbumps: data.orderbumps,
            products: [...res.links],
            productId: data.productId,
            userid: data.userid,
          },
          select: {
            User: {
              select: {
                email: true,
                name: true,
                lastname: true,
                id: true,
              },
            },
            uuid: true,
            userid: true,
          },
        });

        if (!payments) {
          return {
            message: 'Proprietário ou produto não encontrado',
          };
        }
        let pay;
        if (data.method == 0) {
          pay = await this.payService.payWithReference({
            amount: data.amount.toString(),
          });
          if (!pay?.out_trade_no || !payments?.uuid) {
            return {
              message: 'Erro ao efctuar pagamento',
            };
          }
          await this.database.payment.update({
            data: {
              paypayCode: pay?.out_trade_no ?? '',
            },
            where: {
              uuid: payments.uuid,
            },
          });
          return {
            message: 'Aguardando a autorização',
            referece: pay?.reference_id,
            entity: pay?.entity_id,
            id: payments.uuid,
          };
        } else if (data.method == 2) {
          pay = await this.payService.payWithPayPay({
            amount: data.amount.toString(),
          });
          if (!pay?.out_trade_no || !payments?.uuid) {
            return {
              message: 'Erro ao efctuar pagamento',
            };
          }
          await this.database.payment.update({
            data: {
              paypayCode: pay?.out_trade_no ?? '',
            },
            where: {
              uuid: payments.uuid,
            },
          });
          return {
            message: 'Aguardando a autorização',
            ...pay,
            id: payments.uuid,
          };
        } else {
          pay = await this.payService.payWithExpress({
            telefone: data.tel,
            amount: data.amount.toString(),
          });
          if (!pay?.out_trade_no || !payments?.uuid) {
            return {
              message: 'Erro ao efctuar pagamento',
            };
          }
          await this.database.payment.update({
            data: {
              paypayCode: pay?.out_trade_no ?? '',
            },
            where: {
              uuid: payments.uuid,
            },
          });
          return {
            message: 'Aguardando a autorização',
            ...pay,
            id: payments.uuid,
          };
        }
      }
      return {
        status: res.status,
        message: 'Preços não batem',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? 'Erro ao efectuar pagamento',
      );
      return {
        message: 'Erro ao efectuar o pagamento',
      };
    }
  }
}
