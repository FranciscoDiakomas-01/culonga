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
  async findAll(@Headers('userid') userid: string) {
    const [afiliations, notAfiliations] = await Promise.all([
      this.affiliatesService.findAll(userid),
      this.affiliatesService.getProductsToAfiliate(userid),
    ]);
    return {
      afiliations: afiliations.data,
      notAfiliations: afiliations.data,
    };
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Headers('userid') userid: string) {
    return this.affiliatesService.remove(+id, userid);
  }
}
