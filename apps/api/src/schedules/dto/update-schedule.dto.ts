import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsUUID, IsString } from 'class-validator';
import { CreateScheduleDto } from './create-schedule.dto';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  timeIn?: string;

  @IsOptional()
  @IsDateString()
  timeOut?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
