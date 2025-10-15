import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import DatabaseService from '../database/database.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly database: DatabaseService) {}
  @Cron(CronExpression.EVERY_WEEK)
  public async handleCronEvery5Min() {
    this.logger.log('Deleting all Canceled Payments');
    const deleted = await this.database.payment.deleteMany({
      where: {
        OR: [
          {
            status: 'CANCELED',
          },
          {
            status: 'REJECTED',
          },
        ],
      },
    });
    this.logger.log(`Deleted ${deleted.count} Canceled Payments`);
  }
  @Cron(CronExpression.EVERY_WEEK)
  public async deleterInactiveProducts() {
    this.logger.log('Deleting all Canceled Products');
    const deleted = await this.database.products.deleteMany({
      where: {
        OR: [
          {
            status: 'CANCELED',
          },
          {
            status: 'REJECTED',
          },
        ],
      },
    });
    this.logger.log(`Deleted ${deleted.count} Canceled Products`);
  }
  @Cron(CronExpression.EVERY_WEEK)
  public async deleteInactiveSaques() {
    this.logger.log('Deleting all Canceled withdrawal');
    const deleted = await this.database.withdrawal.deleteMany({
      where: {
        OR: [
          {
            status: 'CANCELED',
          },
          {
            status: 'REJECTED',
          },
        ],
      },
    });
    this.logger.log(`Deleted ${deleted.count} Canceled withdrawal`);
  }
}
