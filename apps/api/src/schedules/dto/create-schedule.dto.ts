import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  @IsNotEmpty()
  accountId!: string;

  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @IsDateString()
  date!: string;

  @IsDateString()
  timeIn!: string;

  @IsOptional()
  @IsDateString()
  timeOut?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
