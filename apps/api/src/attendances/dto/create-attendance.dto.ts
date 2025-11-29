import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  accountId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  timeIn?: string;

  @IsOptional()
  @IsDateString()
  timeOut?: string;
}
