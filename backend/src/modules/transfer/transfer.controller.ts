import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  create(
    @Body() createTransferDto: CreateTransferDto,
    @Headers('userid') userid: string,
  ) {
    return this.transferService.create(createTransferDto, userid);
  }

  @Get()
  async findAll(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    if (role?.toUpperCase() == 'ADMIN') {
      return await this.transferService.getAllTrasnfers(page);
    }
    return await this.transferService.getAllMyTransfer(userid, page);
  }
}
