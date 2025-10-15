import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Query,
  HttpCode,
  Header,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Status } from 'generated/prisma';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @Get()
  async findAll(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
    @Query('page') page: number = 1,
    @Query('status') status: string = 'ALL',
  ) {
    if (role?.toUpperCase() == 'ADMIN') {
      return await this.paymentsService.findAll(page, undefined);
    }
    if (status != 'ALL') {
      if (role?.toUpperCase() == 'ADMIN') {
        return await this.paymentsService.getPaymentsByStatus(
          undefined,
          status as Status,
          page,
        );
      }
      return await this.paymentsService.getPaymentsByStatus(
        userid,
        status as Status,
        page,
      );
    }
    return await this.paymentsService.findAll(page, userid);
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post('notify')
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  async update(@Body() data: any) {
    await this.paymentsService.update(data);
    return 'success';
  }
}
