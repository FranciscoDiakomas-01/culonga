import { PartialType } from '@nestjs/swagger';
import { CreateAffiliateDto } from './create-affiliate.dto';

export class UpdateAffiliateDto extends PartialType(CreateAffiliateDto) {}
