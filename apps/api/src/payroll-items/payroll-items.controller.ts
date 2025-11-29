import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePayrollItemDto } from './dto/create-payroll-item.dto';
import { UpdatePayrollItemDto } from './dto/update-payroll-item.dto';
import { PayrollItemsService } from './payroll-items.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true
  })
)
@Controller('payroll-items')
export class PayrollItemsController {
  constructor(private readonly payrollItemsService: PayrollItemsService) {}

  @Post()
  create(@Body() createPayrollItemDto: CreatePayrollItemDto) {
    return this.payrollItemsService.create(createPayrollItemDto);
  }

  @Get()
  findAll(@Query('periodId') periodId?: string, @Query('accountId') accountId?: string) {
    return this.payrollItemsService.findAll({ periodId, accountId });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payrollItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePayrollItemDto: UpdatePayrollItemDto
  ) {
    return this.payrollItemsService.update(id, updatePayrollItemDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payrollItemsService.remove(id);
  }
}
