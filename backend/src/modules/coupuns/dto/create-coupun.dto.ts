import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Length,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @Length(3, 50)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  discount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  usedCount?: number;
}
