import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  timeIn?: string;

  @IsOptional()
  @IsDateString()
  timeOut?: string;
}
