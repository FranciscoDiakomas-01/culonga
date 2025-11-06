import { PartialType } from '@nestjs/swagger';
import { CreateCoupunDto } from './create-coupun.dto';

export class UpdateCoupunDto extends PartialType(CreateCoupunDto) {}
