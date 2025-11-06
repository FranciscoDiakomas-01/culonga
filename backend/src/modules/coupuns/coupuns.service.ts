import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupun.dto';
import { UpdateCoupunDto } from './dto/update-coupun.dto';
import DatabaseService from 'src/services/database/database.service';

@Injectable()
export class CoupunsService {
  constructor(private readonly database: DatabaseService) {}

  async create(data: CreateCouponDto, userid: string) {
    const [isUser, isCupon] = await Promise.all([
      this.database.users.findFirst({
        where: {
          id: userid,
        },
      }),
      this.database.coupon.findFirst({
        where: {
          code: data.code,
        },
      }),
    ]);

    if (!isUser) {
      throw new NotFoundException('Conta não encontrada');
    }
    if (isCupon) {
      throw new ConflictException('Cupon em uso');
    }
    const newCupon = await this.database.coupon.create({
      data: {
        ...data,
        userId: userid,
        active: true,
      },
    });
    throw new HttpException(
      {
        message: 'Coupun crriado',
        data: newCupon,
      },
      HttpStatus.CREATED,
    );
  }

  async findAll(userid: string) {
    const [isUser, cupons] = await Promise.all([
      this.database.users.findFirst({
        where: {
          id: userid,
        },
      }),
      this.database.coupon.findMany({
        where: {
          userId: userid,
        },
      }),
    ]);

    if (!isUser) {
      throw new NotFoundException('Conta não encontrada');
    }
    return {
      data: cupons,
    };
  }
  async remove(id: string, userId: string) {
    const coupon = await this.database.coupon.findFirst({
      where: { id, userId },
    });

    if (!coupon) return null;

    await this.database.coupon.delete({ where: { id } });
    return coupon;
  }

  async toggleStatus(id: string, userId: string) {
    const coupon = await this.database.coupon.findFirst({
      where: { id, userId },
    });

    if (!coupon) return null;

    const updated = await this.database.coupon.update({
      where: { id },
      data: { active: !coupon.active },
    });

    return updated;
  }
}
