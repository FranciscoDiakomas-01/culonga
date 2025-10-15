import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import DatabaseService from 'src/services/database/database.service';

@Injectable()
export class TransferService {
  constructor(private readonly database: DatabaseService) {}

  public async create(createTransferDto: CreateTransferDto, userId: string) {
    const [userFrom, userTo] = await Promise.all([
      this.database.users.findUnique({
        where: { id: userId },
      }),
      this.database.users.findFirst({
        where: { email: createTransferDto.to },
      }),
    ]);

    if (!userFrom) {
      throw new NotFoundException('Conta remetente não encontrada.');
    }

    if (!userTo) {
      throw new NotFoundException('Destinatário não encontrado.');
    }

    if (userFrom.availableBalance < createTransferDto.amount) {
      throw new BadRequestException('Saldo insuficiente.');
    }
    const [updatedSender, updatedReceiver, transfer] =
      await this.database.$transaction([
        this.database.users.update({
          where: { id: userFrom.id },
          data: {
            availableBalance:
              userFrom.availableBalance - createTransferDto.amount,
            totalTranfered: userFrom.totalTranfered + createTransferDto.amount,
          },
        }),

        this.database.users.update({
          where: { id: userTo.id },
          data: {
            availableBalance:
              userTo.availableBalance + createTransferDto.amount,
            totatReciev: userTo.totatReciev + createTransferDto.amount,
          },
        }),

        this.database.transfer.create({
          data: {
            amount: createTransferDto.amount,
            type: 'EXTERNAL',
            fromId: userFrom.id,
            toId: userTo.id,
            status: 'APROVED',
          },
        }),
      ]);

    return {
      success: true,
      message: 'Transferência realizada com sucesso.',
      transfer,
    };
  }
  public async getAllMyTransfer(userId: string, page = 1) {
    const limit = 20;
    const user = await this.database.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const skip = (page - 1) * limit;

    const [total, transfers] = await Promise.all([
      this.database.transfer.count({
        where: {
          OR: [{ fromId: userId }, { toId: userId }],
        },
      }),
      this.database.transfer.findMany({
        where: {
          OR: [{ fromId: userId }, { toId: userId }],
        },
        include: {
          fromUser: {
            select: { id: true, name: true, email: true },
          },
          toUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Transferências encontradas com sucesso.',
      page,
      limit,
      total,
      totalPages,
      transfers,
      stats: {
        recived: user.totatReciev,
        transfered: user.totalTranfered,
      },
    };
  }
  public async getAllTrasnfers(page: number) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const [total, transfers] = await Promise.all([
      this.database.transfer.count({}),
      this.database.transfer.findMany({
        include: {
          fromUser: {
            select: { id: true, name: true, email: true },
          },
          toUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      message: 'Transferências encontradas com sucesso.',
      page,
      limit,
      total,
      totalPages,
      transfers,
    };
  }
}
