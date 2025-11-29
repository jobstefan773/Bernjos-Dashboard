import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

interface ScheduleFilters {
  accountId?: string;
  branchId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    try {
      return await this.prisma.schedule.create({
        data: this.mapToScheduleData(createScheduleDto)
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(filters: ScheduleFilters) {
    const where: Prisma.ScheduleWhereInput = {};

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }
    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.date) {
      where.date = new Date(filters.date);
    } else if (filters.startDate || filters.endDate) {
      where.date = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {})
      };
    }

    return this.prisma.schedule.findMany({
      where,
      orderBy: { date: 'asc' }
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${id} not found`);
    }
    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    try {
      return await this.prisma.schedule.update({
        where: { id },
        data: this.mapToScheduleData(updateScheduleDto)
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.schedule.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private mapToScheduleData(dto: Partial<CreateScheduleDto | UpdateScheduleDto>): Prisma.ScheduleUncheckedCreateInput {
    const { accountId, branchId, date, timeIn, timeOut, notes } = dto;

    return {
      accountId: accountId ?? undefined,
      branchId: branchId ?? undefined,
      date: date ? new Date(date) : undefined,
      timeIn: timeIn ? new Date(timeIn) : undefined,
      timeOut: timeOut ? new Date(timeOut) : undefined,
      notes: notes ?? undefined
    } as Prisma.ScheduleUncheckedCreateInput;
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Schedule for this account and date already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Schedule with id ${id ?? 'unknown'} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related account or branch not found');
      }
    }
    throw error;
  }
}
