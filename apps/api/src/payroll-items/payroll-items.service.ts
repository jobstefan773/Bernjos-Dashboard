import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, PayStatus, RateType, PayRate, Attendance } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreatePayrollItemDto } from './dto/create-payroll-item.dto';
import { UpdatePayrollItemDto } from './dto/update-payroll-item.dto';

@Injectable()
export class PayrollItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPayrollItemDto: CreatePayrollItemDto) {
    await this.ensurePeriodIsUnlocked(createPayrollItemDto.periodId);

    try {
      return await this.prisma.payrollItem.create({
        data: this.mapCreateDtoToData(createPayrollItemDto)
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(filters: { periodId?: string; accountId?: string }) {
    return this.prisma.payrollItem.findMany({
      where: {
        ...(filters.periodId ? { periodId: filters.periodId } : {}),
        ...(filters.accountId ? { accountId: filters.accountId } : {})
      },
      orderBy: [{ periodId: 'asc' }, { accountId: 'asc' }]
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.payrollItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Payroll item with id ${id} not found`);
    }
    return item;
  }

  async update(id: string, updatePayrollItemDto: UpdatePayrollItemDto) {
    const existing = await this.prisma.payrollItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Payroll item with id ${id} not found`);
    }
    await this.ensurePeriodIsUnlocked(updatePayrollItemDto.periodId ?? existing.periodId);

    try {
      return await this.prisma.payrollItem.update({
        where: { id },
        data: this.mapUpdateDtoToData(updatePayrollItemDto)
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string) {
    const item = await this.prisma.payrollItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Payroll item with id ${id} not found`);
    }
    await this.ensurePeriodIsUnlocked(item.periodId);

    try {
      await this.prisma.payrollItem.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async generatePayrollForPeriod(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      throw new NotFoundException(`Payroll period with id ${periodId} not found`);
    }
    if (period.isLocked) {
      throw new ForbiddenException('Payroll period is locked');
    }

    const accounts = await this.prisma.account.findMany({ where: { isActive: true } });

    const results = [];
    for (const account of accounts) {
      const payRate = await this.prisma.payRate.findUnique({
        where: { accountId: account.id }
      });

      const attendances = await this.prisma.attendance.findMany({
        where: {
          accountId: account.id,
          date: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      });

      const cashAdvances = await this.prisma.cashAdvance.findMany({
        where: {
          accountId: account.id,
          isDeducted: false,
          dateGranted: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      });

      const computed = this.computePayrollForAccount(payRate, attendances);

      const deductions = computed.deductions + cashAdvances.reduce((sum, ca) => sum + ca.amount, 0);
      const netPay = computed.grossPay - deductions + computed.allowances;

      const payload: Prisma.PayrollItemUncheckedCreateInput = {
        periodId,
        accountId: account.id,
        grossPay: computed.grossPay,
        netPay,
        totalDays: computed.totalDays,
        totalOvertime: computed.totalOvertime,
        totalLate: computed.totalLate,
        totalUndertime: computed.totalUndertime,
        deductions,
        allowances: computed.allowances,
        status: PayStatus.PENDING
      };

      const item = await this.prisma.payrollItem.upsert({
        where: { periodId_accountId: { periodId, accountId: account.id } },
        update: payload,
        create: payload
      });

      // Mark cash advances as deducted
      if (cashAdvances.length > 0) {
        await this.prisma.cashAdvance.updateMany({
          where: { id: { in: cashAdvances.map((ca) => ca.id) } },
          data: { isDeducted: true, deductedAt: new Date() }
        });
      }

      results.push(item);
    }

    return results;
  }

  private computePayrollForAccount(payRate: PayRate | null, attendances: Attendance[]) {
    const totalDays = attendances.filter((att) => !att.isAbsent).length;
    const totalLate = attendances.reduce((sum, att) => sum + (att.lateMinutes ?? 0), 0);
    const totalUndertime = attendances.reduce((sum, att) => sum + (att.undertimeMinutes ?? 0), 0);
    const totalOvertime = attendances.reduce((sum, att) => sum + (att.overtimeMinutes ?? 0), 0);

    const workedMinutes = attendances.reduce((sum, att) => {
      if (att.timeIn && att.timeOut) {
        return sum + (att.timeOut.getTime() - att.timeIn.getTime()) / 60000;
      }
      return sum;
    }, 0);

    const baseRate = payRate?.baseRate ?? 0;
    const overtimeRate = payRate?.overtimeRate ?? baseRate;
    let grossPay = 0;

    if (payRate?.rateType === RateType.DAILY) {
      grossPay = baseRate * totalDays;
    } else if (payRate?.rateType === RateType.HOURLY) {
      grossPay = baseRate * (workedMinutes / 60);
    } else if (payRate?.rateType === RateType.MONTHLY) {
      grossPay = baseRate;
    }

    // Simple overtime add-on (minutes -> hours)
    grossPay += (totalOvertime / 60) * overtimeRate;

    const deductions = 0; // placeholder for late/undertime monetary conversion
    const allowances = 0;

    return { totalDays, totalLate, totalUndertime, totalOvertime, grossPay, deductions, allowances };
  }

  private async ensurePeriodIsUnlocked(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      throw new NotFoundException(`Payroll period with id ${periodId} not found`);
    }
    if (period.isLocked) {
      throw new ForbiddenException('Payroll period is locked');
    }
  }

  private mapCreateDtoToData(dto: CreatePayrollItemDto): Prisma.PayrollItemUncheckedCreateInput {
    return {
      periodId: dto.periodId,
      accountId: dto.accountId,
      grossPay: dto.grossPay,
      netPay: dto.netPay,
      totalDays: dto.totalDays,
      totalOvertime: dto.totalOvertime,
      totalLate: dto.totalLate,
      totalUndertime: dto.totalUndertime,
      deductions: dto.deductions,
      allowances: dto.allowances,
      status: dto.status ?? PayStatus.PENDING,
      approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : undefined,
      releasedAt: dto.releasedAt ? new Date(dto.releasedAt) : undefined
    };
  }

  private mapUpdateDtoToData(dto: UpdatePayrollItemDto): Prisma.PayrollItemUncheckedUpdateInput {
    return {
      periodId: dto.periodId ?? undefined,
      accountId: dto.accountId ?? undefined,
      grossPay: dto.grossPay ?? undefined,
      netPay: dto.netPay ?? undefined,
      totalDays: dto.totalDays ?? undefined,
      totalOvertime: dto.totalOvertime ?? undefined,
      totalLate: dto.totalLate ?? undefined,
      totalUndertime: dto.totalUndertime ?? undefined,
      deductions: dto.deductions ?? undefined,
      allowances: dto.allowances ?? undefined,
      status: dto.status ?? undefined,
      approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : undefined,
      releasedAt: dto.releasedAt ? new Date(dto.releasedAt) : undefined
    };
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Payroll item for this period and account already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Payroll item with id ${id ?? 'unknown'} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related account or payroll period not found');
      }
    }
    throw error;
  }
}
