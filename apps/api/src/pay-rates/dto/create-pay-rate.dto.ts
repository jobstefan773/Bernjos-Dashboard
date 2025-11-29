import { RateType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreatePayRateDto {
  @IsUUID()
  @IsNotEmpty()
  accountId!: string;

  @IsEnum(RateType)
  rateType!: RateType;

  @Type(() => Number)
  @IsNumber()
  baseRate!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  overtimeRate?: number;
}
