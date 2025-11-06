import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { CoupunsService } from './coupuns.service';
import { CreateCouponDto } from './dto/create-coupun.dto';

@Controller('coupuns')
export class CoupunsController {
  constructor(private readonly coupunsService: CoupunsService) {}

  @Post()
  create(
    @Body() CreateCouponDto: CreateCouponDto,
    @Headers('userid') userid: string,
  ) {
    return this.coupunsService.create(CreateCouponDto, userid);
  }

  @Get()
  findAll(@Headers('userid') userid: string) {
    return this.coupunsService.findAll(userid);
  }

  @Patch(':id/toggle')
  async toggleStatus(
    @Param('id') id: string,
    @Headers('userid') userid: string,
  ) {
    const updated = await this.coupunsService.toggleStatus(id, userid);
    if (!updated) {
      throw new NotFoundException(
        'Cupom não encontrado ou não pertence ao usuário',
      );
    }
    return {
      message: 'Status do cupom atualizado',
      data: updated,
    };
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Headers('userid') userid: string) {
    const deleted = await this.coupunsService.remove(id, userid);
    if (!deleted) {
      throw new NotFoundException(
        'Cupom não encontrado ou não pertence ao usuário',
      );
    }
    return {
      message: 'Cupom removido com sucesso',
    };
  }
}
