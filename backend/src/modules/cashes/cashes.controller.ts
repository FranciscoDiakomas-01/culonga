import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Query,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { CashesService } from './cashes.service';
import { CreateTransactionDto } from './dto/create-cash.dto';

@Controller('transaction')
export class CashesController {
  constructor(private readonly cashesService: CashesService) {}

  @Post()
  public async create(
    @Body() createCashDto: CreateTransactionDto,
    @Headers('userid') userid: string,
  ) {
    createCashDto.userid = userid;
    return await this.cashesService.create(createCashDto);
  }

  @Get()
  public async findAll(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
    @Query('page') page: number = 1,
  ) {
    if (role?.toLocaleLowerCase() == 'admin') {
      return await this.cashesService.getAllTraictions(page, undefined);
    }
    return await this.cashesService.getAllTraictions(page, userid);
  }

  @Get('stats')
  public async getStats(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
  ) {
    if (role == 'SELLER') {
      const data = await this.cashesService.getMyTransictionStats(userid);
      return data;
    }
    const data = await this.cashesService.getMyTransictionStats(undefined);
    return data;
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Headers('role') role: string,
    @Query('status') status: '1' | '0' = '1',
    @Body("file") file : string
  ) {
    if (role.toUpperCase() != 'ADMIN') {
      throw new UnauthorizedException('Não autorizado');
    }
    return await this.cashesService.update(id , status , file);
  }
}
