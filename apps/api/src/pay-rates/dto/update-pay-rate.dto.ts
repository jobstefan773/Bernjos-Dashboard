import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RateType } from '@prisma/client';
import { CreatePayRateDto } from './create-pay-rate.dto';

export class UpdatePayRateDto extends PartialType(CreatePayRateDto) {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsEnum(RateType)
  rateType?: RateType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baseRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  overtimeRate?: number;
}
