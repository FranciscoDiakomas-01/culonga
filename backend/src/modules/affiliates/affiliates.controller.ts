import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';

@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post()
  create() {}

  @Get()
  findAll() {
    return this.affiliatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affiliatesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.affiliatesService.remove(+id);
  }
}
