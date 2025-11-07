import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';
import EmailService from 'src/services/Email/email.service';

@Injectable()
export class AffiliatesService {
  private readonly email = new EmailService();
  constructor(private readonly database: DatabaseService) {}
  public async create(productId: string, userId: string) {
    const [product, user, afiliation] = await Promise.all([
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
      this.database.afiliates.findFirst({
        where: {
          productId,
          userId,
        },
      }),
    ]);

    if (afiliation) {
      throw new ConflictException('Afiliação existente');
    }
    if (!user) {
      throw new NotFoundException('Afiliação existente');
    }
    if (!product) {
      throw new NotFoundException('Afiliação existente');
    }
  }

  findAll() {
    return `This action returns all affiliates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} affiliate`;
  }

  remove(id: number) {
    return `This action removes a #${id} affiliate`;
  }
}
