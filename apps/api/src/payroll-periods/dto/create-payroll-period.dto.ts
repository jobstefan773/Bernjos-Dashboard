import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isLocked?: boolean;
}
