import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEnum, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PayStatus } from '@prisma/client';
import { CreatePayrollItemDto } from './create-payroll-item.dto';

export class UpdatePayrollItemDto extends PartialType(CreatePayrollItemDto) {
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  grossPay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  netPay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalOvertime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalLate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalUndertime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  allowances?: number;

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
