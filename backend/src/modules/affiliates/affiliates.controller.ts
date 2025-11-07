import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Headers,
  Query,
} from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';

@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}
  @Post(':id')
  create(@Headers('userid') userid: string, @Param('id') id: string) {
    return this.affiliatesService.create(id, userid);
  }
  @Get()
  async findAll(
    @Headers('userid') userid: string,
    @Query('page') page: number = 1,
  ) {
    const [afiliations, notAfiliations] = await Promise.all([
      this.affiliatesService.findAll(userid),
      this.affiliatesService.getProductsToAfiliate(userid, page),
    ]);

    return {
      afiliations,
      notAfiliations,
    };
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Headers('userid') userid: string) {
    return this.affiliatesService.remove(+id, userid);
  }
}
