import { PayStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID
} from 'class-validator';

export class CreatePayrollItemDto {
  @IsUUID()
  @IsNotEmpty()
  periodId!: string;

  @IsUUID()
  @IsNotEmpty()
  accountId!: string;

  @Type(() => Number)
  @IsNumber()
  grossPay!: number;

  @Type(() => Number)
  @IsNumber()
  netPay!: number;

  @Type(() => Number)
  @IsNumber()
  totalDays!: number;

  @Type(() => Number)
  @IsNumber()
  totalOvertime!: number;

  @Type(() => Number)
  @IsNumber()
  totalLate!: number;

  @Type(() => Number)
  @IsNumber()
  totalUndertime!: number;

  @Type(() => Number)
  @IsNumber()
  deductions!: number;

  @Type(() => Number)
  @IsNumber()
  allowances!: number;

  @IsOptional()
  @IsEnum(PayStatus)
  status?: PayStatus;

  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @IsOptional()
  @IsDateString()
  releasedAt?: string;
}
