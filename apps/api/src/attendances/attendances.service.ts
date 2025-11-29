import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const date = new Date(createAttendanceDto.date);
    const accountId = createAttendanceDto.accountId;
    const timeIn = createAttendanceDto.timeIn ? new Date(createAttendanceDto.timeIn) : null;
    const timeOut = createAttendanceDto.timeOut ? new Date(createAttendanceDto.timeOut) : null;

    const derived = await this.computeDerived(accountId, date, timeIn, timeOut);

    try {
      return await this.prisma.attendance.upsert({
        where: { accountId_date: { accountId, date } },
        create: {
          accountId,
          date,
          timeIn,
          timeOut,
          ...derived
        },
        update: {
          timeIn,
          timeOut,
          ...derived
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(filters: { accountId?: string; startDate?: string; endDate?: string; date?: string }) {
    const where: Prisma.AttendanceWhereInput = {};

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters.date) {
      where.date = new Date(filters.date);
    } else if (filters.startDate || filters.endDate) {
      where.date = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {})
      };
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' }
    });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) {
      throw new NotFoundException(`Attendance with id ${id} not found`);
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Attendance with id ${id} not found`);
    }

    const accountId = updateAttendanceDto.accountId ?? existing.accountId;
    const date = updateAttendanceDto.date ? new Date(updateAttendanceDto.date) : existing.date;
    const timeIn = updateAttendanceDto.timeIn ? new Date(updateAttendanceDto.timeIn) : existing.timeIn;
    const timeOut = updateAttendanceDto.timeOut ? new Date(updateAttendanceDto.timeOut) : existing.timeOut;

    const derived = await this.computeDerived(accountId, date, timeIn ?? null, timeOut ?? null);

    try {
      return await this.prisma.attendance.update({
        where: { id },
        data: {
          accountId,
          date,
          timeIn: timeIn ?? null,
          timeOut: timeOut ?? null,
          ...derived
        }
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.attendance.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private async computeDerived(accountId: string, date: Date, timeIn: Date | null, timeOut: Date | null) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { accountId, date }
    });

    let lateMinutes: number | null = null;
    let undertimeMinutes: number | null = null;
    let overtimeMinutes: number | null = null;
    let isAbsent: boolean | null = null;

    if (schedule) {
      const scheduledIn = schedule.timeIn;
      const scheduledOut = schedule.timeOut;

      if (scheduledIn && timeIn) {
        lateMinutes = Math.max(0, this.diffInMinutes(timeIn, scheduledIn));
      }

      if (scheduledOut && timeOut) {
        undertimeMinutes = Math.max(0, this.diffInMinutes(scheduledOut, timeOut));
        overtimeMinutes = Math.max(0, this.diffInMinutes(timeOut, scheduledOut));
      }

      isAbsent = !timeIn && !timeOut;
    }

    return { lateMinutes, undertimeMinutes, overtimeMinutes, isAbsent };
  }

  private diffInMinutes(later: Date, earlier: Date) {
    return Math.floor((later.getTime() - earlier.getTime()) / 60000);
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Attendance for this account and date already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Attendance with id ${id ?? 'unknown'} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related account not found');
      }
    }
    throw error;
  }
}
