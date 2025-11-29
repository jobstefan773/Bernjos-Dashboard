import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, PayStatus } from '@prisma/client';
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
        data: this.mapDtoToData(createPayrollItemDto)
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
        data: this.mapDtoToData(updatePayrollItemDto)
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

  private async ensurePeriodIsUnlocked(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      throw new NotFoundException(`Payroll period with id ${periodId} not found`);
    }
    if (period.isLocked) {
      throw new ForbiddenException('Payroll period is locked');
    }
  }

  private mapDtoToData(dto: Partial<CreatePayrollItemDto | UpdatePayrollItemDto>): Prisma.PayrollItemUncheckedCreateInput {
    return {
      periodId: dto.periodId ?? undefined,
      accountId: dto.accountId ?? undefined,
      grossPay: dto.grossPay as number | undefined,
      netPay: dto.netPay as number | undefined,
      totalDays: dto.totalDays as number | undefined,
      totalOvertime: dto.totalOvertime as number | undefined,
      totalLate: dto.totalLate as number | undefined,
      totalUndertime: dto.totalUndertime as number | undefined,
      deductions: dto.deductions as number | undefined,
      allowances: dto.allowances as number | undefined,
      status: (dto.status as PayStatus | undefined) ?? undefined,
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
