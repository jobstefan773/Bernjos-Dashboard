import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePayrollPeriodDto } from './create-payroll-period.dto';

export class UpdatePayrollPeriodDto extends PartialType(CreatePayrollPeriodDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isLocked?: boolean;
}
