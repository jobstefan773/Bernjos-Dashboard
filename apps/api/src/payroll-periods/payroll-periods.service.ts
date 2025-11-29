import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';

@Injectable()
export class PayrollPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPayrollPeriodDto: CreatePayrollPeriodDto) {
    this.validateDates(createPayrollPeriodDto.startDate, createPayrollPeriodDto.endDate);
    try {
      return await this.prisma.payrollPeriod.create({
        data: {
          name: createPayrollPeriodDto.name,
          startDate: new Date(createPayrollPeriodDto.startDate),
          endDate: new Date(createPayrollPeriodDto.endDate),
          isLocked: createPayrollPeriodDto.isLocked ?? false
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.payrollPeriod.findMany({
      orderBy: { startDate: 'desc' }
    });
  }

  async findOne(id: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id } });
    if (!period) {
      throw new NotFoundException(`Payroll period with id ${id} not found`);
    }
    return period;
  }

  async update(id: string, updatePayrollPeriodDto: UpdatePayrollPeriodDto) {
    if (updatePayrollPeriodDto.startDate || updatePayrollPeriodDto.endDate) {
      this.validateDates(updatePayrollPeriodDto.startDate, updatePayrollPeriodDto.endDate);
    }

    try {
      return await this.prisma.payrollPeriod.update({
        where: { id },
        data: {
          name: updatePayrollPeriodDto.name,
          startDate: updatePayrollPeriodDto.startDate
            ? new Date(updatePayrollPeriodDto.startDate)
            : undefined,
          endDate: updatePayrollPeriodDto.endDate ? new Date(updatePayrollPeriodDto.endDate) : undefined,
          isLocked: updatePayrollPeriodDto.isLocked
        }
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string) {
    const itemsCount = await this.prisma.payrollItem.count({ where: { periodId: id } });
    if (itemsCount > 0) {
      throw new ConflictException('Cannot delete payroll period with existing payroll items');
    }

    try {
      await this.prisma.payrollPeriod.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private validateDates(start?: string, end?: string) {
    if (start && end && new Date(start) > new Date(end)) {
      throw new BadRequestException('startDate must be before endDate');
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Payroll period with id ${id ?? 'unknown'} not found`);
      }
    }
    throw error;
  }
}
