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
import MessagingService from 'src/services/Message/message.service';
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
    const [admin, payment] = await Promise.all([
      this.database.users.findFirst({
        where: {
          id: data.userid,
          role: 'ADMIN',
        },
      }),
      this.database.payment.findFirst({
        where: {
          OR: [
            {
              uuid: data.payid,
            },
          ],
        },
        include: {
          User: true,
        },
      }),
    ]);

    if (!admin) {
      throw new ForbiddenException('Acesso negado');
    }
    if (!payment || !payment.User) {
      throw new NotFoundException('Produto não encontrado');
    }
    if (payment.status != 'PENDING') {
      throw new NotFoundException('Pagamento já foi modificado');
    }
    const Product = await this.database.products.findFirst({
      where: { id: payment.productId },
    });

    if (Product && Product?.price != payment.amount) {
      await this.database.payment.update({
        data: { status: 'CANCELED' },
        where: { uuid: data.payid },
      });
      throw new BadRequestException({
        message: 'O cliente não pagou o valor esperado ',
        description: `Valor do Produto ${Product.price?.toLocaleString('pt')} kz , valor pago pelo cliente ${payment.amount.toLocaleString('pt')} kz`,
      });
    }
    const mappedStatus: Status = data.status == '1' ? 'APROVED' : 'CANCELED';
    await this.database.payment.update({
      data: { status: mappedStatus },
      where: { uuid: data.payid },
    });
    if (mappedStatus == 'APROVED') {
      const emailService = new EmailService();
      const messagingService = new MessagingService();

      const valor = payment.amount;
      await Promise.all([
        emailService.senEmail({
          to: payment.User.email,
          subject: '✅ Compra Realizada',
          html: `<h1>Compra confirmada</h1><p>Produto: ${Product?.title}</p> <br/> <p>Link: ${Product?.file}</p>`,
        }),

        messagingService.sendMessage(
          payment.User.telefone,
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
        await this.pushKit.send(),
        await ExuteMyWebhooks(payment.userid, this.database, payment.uuid),
      ]);
    }
    return { message: 'Pagamento modificado' };
  }

  private percent(montante: number): number {
    const taxaPlataforma = 0.08;
    const liquido = montante * (1 - taxaPlataforma);
    return Number(liquido.toFixed(2));
  }
}
