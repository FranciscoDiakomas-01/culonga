import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import DatabaseService from 'src/services/database/database.service';
import IsActiveUser from 'src/interceptors/isActiveUser';

@Injectable()
export class BankService {
  private readonly isACtive: IsActiveUser;
  constructor(private readonly database: DatabaseService) {
    this.isACtive = new IsActiveUser(this.database);
  }

  public async create(createBankDto: CreateBankDto) {
    try {
      const isACtive = await this.isACtive.isActive(createBankDto.userid);

      if (!isACtive) {
        return {
          message: 'Sua conta foi banida',
        };
      }
      const createdBank = await this.database.bank.create({
        data: {
          ...createBankDto,
        },
      });
      if (createdBank?.id) {
        return {
          message: 'Carteira criada',
        };
      }
      return {
        message: 'Erro ao registrar a carteira',
      };
    } catch (error) {
      return {
        message: 'Erro ao registrar a carteira',
      };
    }
  }

  public async getALl(userid: string) {
    try {
      const banks = await this.database.bank.findMany({
        where: {
          userid,
        },
      });
      return banks;
    } catch (error) {
      return [];
    }
  }

  public async update(id: string, updateBankDto: CreateBankDto) {
    try {
      const updatedBank = await this.database.bank.update({
        where: {
          id,
          userid: updateBankDto.userid,
        },
        data: {
          ...updateBankDto,
        },
      });

      return updatedBank?.id
        ? { message: 'Actualizado' }
        : { message: 'Erro ao actualizar' };
    } catch (error) {
      return {
        message: 'Erro ao actualizar',
      };
    }
  }
  public async delete(id: string, userid: string) {
    try {
      const banks = await this.database.bank.delete({
        where: {
          id,
          userid,
        },
      });
      return banks?.id ? { deleted: true } : { deleted: false };
    } catch (error) {
      return {
        deleted: false,
        message: 'Erro ao eliminar carteira',
      };
    }
  }
}
