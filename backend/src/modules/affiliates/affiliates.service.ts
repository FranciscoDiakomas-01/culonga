import { Injectable } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import EmailService from 'src/services/Email/email.service';

@Injectable()
export class AffiliatesService {
  private readonly email = new EmailService();
  constructor(private readonly database: DatabaseService) {}
  public async create(productId: string, userId: string) {
    const [] = await Promise.all([
      this.database.products.findFirst({
        where: {
          id: productId,
        },
      }),
      this.database.users.findFirst({
        where: {
          id: userId,
        },
      }),
      this.database.a.findFirst({
        where: {
          id: productId,
        },
      }),
    ]);
  }

  findAll() {
    return `This action returns all affiliates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} affiliate`;
  }

  update(id: number, updateAffiliateDto: UpdateAffiliateDto) {
    return `This action updates a #${id} affiliate`;
  }

  remove(id: number) {
    return `This action removes a #${id} affiliate`;
  }
}
