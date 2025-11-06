import { Injectable } from '@nestjs/common';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';

@Injectable()
export class AffiliatesService {
  create(createAffiliateDto: CreateAffiliateDto) {
    return 'This action adds a new affiliate';
  }

  findAll() {
    return `This action returns all affiliates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} affiliate`;
  }

  update(id: number, updateAffiliateDto: UpdateAffiliateDto) {
    return `This action updates a #${id} affiliate`;
  }

  remove(id: number) {
    return `This action removes a #${id} affiliate`;
  }
}
