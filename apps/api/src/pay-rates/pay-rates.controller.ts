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
import { CreatePayRateDto } from './dto/create-pay-rate.dto';
import { UpdatePayRateDto } from './dto/update-pay-rate.dto';
import { PayRatesService } from './pay-rates.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true
  })
)
@Controller('pay-rates')
export class PayRatesController {
  constructor(private readonly payRatesService: PayRatesService) {}

  @Post()
  create(@Body() createPayRateDto: CreatePayRateDto) {
    return this.payRatesService.create(createPayRateDto);
  }

  @Get()
  findAll(@Query('accountId') accountId?: string) {
    return this.payRatesService.findAll(accountId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payRatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updatePayRateDto: UpdatePayRateDto) {
    return this.payRatesService.update(id, updatePayRateDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payRatesService.remove(id);
  }
}
