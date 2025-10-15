import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaypayNotifyDto } from './dto/update-payment.dto';
import DatabaseService from 'src/services/database/database.service';
import PaymentCreater from './usecases/create';
import PaymentGetter from './usecases/get';
import PaymentUpdate from './usecases/update';
import { Status } from 'generated/prisma';

@Injectable()
export class PaymentsService {
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
}
