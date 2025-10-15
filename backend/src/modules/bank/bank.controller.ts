import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  create(
    @Body() createBankDto: CreateBankDto,
    @Headers('userid') userid: string,
  ) {
    createBankDto.userid = userid;
    return this.bankService.create(createBankDto);
  }

  @Get()
  findAll(@Headers('userid') userid: string) {
    return this.bankService.getALl(userid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBankDto: CreateBankDto,
    @Headers('userid') userid: string,
  ) {
    updateBankDto.userid = userid;
    return this.bankService.update(id, updateBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('userid') userid: string) {
    return this.bankService.delete(id, userid);
  }
}
