import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-cash.dto';
import TransitionSetter from './usecases/create';
import DatabaseService from 'src/services/database/database.service';
import TransiActionGetter from './usecases/get';
import AproveWidrall from './usecases/update';

@Injectable()
export class CashesService {
  constructor(private readonly database: DatabaseService) {}
  public async create(data: CreateTransactionDto) {
    const creater = new TransitionSetter(this.database);
    const created = await creater.createTransiaction(data);
    return created;
  }

  public async getAllTraictions(page: number = 1, userid: string | undefined) {
    const getter = new TransiActionGetter(this.database);
    const mytrasiction = await getter.getTrasactions(userid, page);
    return mytrasiction;
  }

  public async getMyTransictionStats(userid: string | undefined) {
    const getter = new TransiActionGetter(this.database);
    const mytrasiction = await getter.getTranisactionStats(userid);
    return mytrasiction;
  }

  public async update(id: string, status: '1' | '0' , file : string) {
    const updater = await AproveWidrall(id, this.database , status , file);
    return updater;
  }
}
