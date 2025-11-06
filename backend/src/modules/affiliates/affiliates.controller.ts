import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';

@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post()
  create(@Body() createAffiliateDto: CreateAffiliateDto) {
    return this.affiliatesService.create(createAffiliateDto);
  }

  @Get()
  findAll() {
    return this.affiliatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affiliatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAffiliateDto: UpdateAffiliateDto) {
    return this.affiliatesService.update(+id, updateAffiliateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.affiliatesService.remove(+id);
  }
}
