import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';
import { PayrollPeriodsService } from './payroll-periods.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true
  })
)
@Controller('payroll-periods')
export class PayrollPeriodsController {
  constructor(private readonly payrollPeriodsService: PayrollPeriodsService) {}

  @Post()
  create(@Body() createPayrollPeriodDto: CreatePayrollPeriodDto) {
    return this.payrollPeriodsService.create(createPayrollPeriodDto);
  }

  @Get()
  findAll() {
    return this.payrollPeriodsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payrollPeriodsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePayrollPeriodDto: UpdatePayrollPeriodDto
  ) {
    return this.payrollPeriodsService.update(id, updatePayrollPeriodDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payrollPeriodsService.remove(id);
  }
}
