import { LeaveStatus } from '@prisma/client';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsUUID()
  @IsNotEmpty()
  accountId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
