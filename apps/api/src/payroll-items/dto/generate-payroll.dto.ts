import { IsNotEmpty, IsUUID } from 'class-validator';

export class GeneratePayrollDto {
  @IsUUID()
  @IsNotEmpty()
  periodId!: string;
}
