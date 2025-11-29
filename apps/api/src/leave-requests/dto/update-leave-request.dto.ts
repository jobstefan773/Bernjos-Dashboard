import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { LeaveStatus } from '@prisma/client';
import { CreateLeaveRequestDto } from './create-leave-request.dto';

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
