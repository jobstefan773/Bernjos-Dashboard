import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { LeaveStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';

interface LeaveFilters {
  accountId?: string;
  branchId?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class LeaveRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto, currentUser: { userId: string; role: Role }) {
    const now = new Date();
    const start = new Date(createLeaveRequestDto.startDate);
    const end = new Date(createLeaveRequestDto.endDate);

    this.validateDates(start, end);
    this.enforceAdvanceRule(now, start);

    await this.ensureNoOverlap(createLeaveRequestDto.accountId, start, end);

    try {
      return await this.prisma.leaveRequest.create({
        data: {
          accountId: createLeaveRequestDto.accountId,
          branchId: createLeaveRequestDto.branchId,
          startDate: start,
          endDate: end,
          reason: createLeaveRequestDto.reason,
          status: LeaveStatus.PENDING,
          requestedAt: now
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(filters: LeaveFilters, currentUser: { userId: string; role: Role; accountId: string }) {
    const where: Prisma.LeaveRequestWhereInput = {
      ...(filters.accountId ? { accountId: filters.accountId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            AND: {
              startDate: filters.endDate ? { lte: new Date(filters.endDate) } : undefined,
              endDate: filters.startDate ? { gte: new Date(filters.startDate) } : undefined
            }
          }
        : {})
    };

    // Non-admins see only their own
    if (![Role.ADMIN, Role.SUPERADMIN].includes(currentUser.role)) {
      where.accountId = currentUser.accountId;
    }

    return this.prisma.leaveRequest.findMany({
      where,
      orderBy: { startDate: 'desc' }
    });
  }

  async findOne(id: string, currentUser: { role: Role; accountId: string }) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      throw new NotFoundException(`Leave request with id ${id} not found`);
    }
    if (![Role.ADMIN, Role.SUPERADMIN].includes(currentUser.role) && leave.accountId !== currentUser.accountId) {
      throw new ForbiddenException('Not allowed to view this leave request');
    }
    return leave;
  }

  async update(
    id: string,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
    currentUser: { userId: string; role: Role; accountId: string }
  ) {
    const existing = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Leave request with id ${id} not found`);
    }

    const isAdmin = [Role.ADMIN, Role.SUPERADMIN].includes(currentUser.role);
    const isOwner = existing.accountId === currentUser.accountId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Not allowed to update this leave request');
    }

    // Normal employees can only edit pending requests
    if (!isAdmin && existing.status !== LeaveStatus.PENDING) {
      throw new ForbiddenException('Only pending requests can be edited');
    }

    const nextStatus = updateLeaveRequestDto.status ?? existing.status;
    const start = updateLeaveRequestDto.startDate ? new Date(updateLeaveRequestDto.startDate) : existing.startDate;
    const end = updateLeaveRequestDto.endDate ? new Date(updateLeaveRequestDto.endDate) : existing.endDate;
    this.validateDates(start, end);

    // If status change to APPROVED, ensure no overlap
    if (nextStatus === LeaveStatus.APPROVED) {
      await this.ensureNoOverlap(existing.accountId, start, end, id);
    }

    const data: Prisma.LeaveRequestUpdateInput = {
      branchId: updateLeaveRequestDto.branchId,
      startDate: updateLeaveRequestDto.startDate ? start : undefined,
      endDate: updateLeaveRequestDto.endDate ? end : undefined,
      reason: updateLeaveRequestDto.reason,
      status: updateLeaveRequestDto.status,
      rejectionReason: updateLeaveRequestDto.rejectionReason
    };

    if (updateLeaveRequestDto.status && updateLeaveRequestDto.status !== existing.status) {
      data.reviewedAt = new Date();
      data.reviewedById = currentUser.userId;

      if (updateLeaveRequestDto.status === LeaveStatus.REJECTED && !updateLeaveRequestDto.rejectionReason) {
        throw new BadRequestException('rejectionReason is required when rejecting');
      }
    }

    try {
      return await this.prisma.leaveRequest.update({
        where: { id },
        data
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string, currentUser: { role: Role }) {
    if (![Role.ADMIN, Role.SUPERADMIN].includes(currentUser.role)) {
      throw new ForbiddenException('Only admins can delete leave requests');
    }
    try {
      await this.prisma.leaveRequest.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private validateDates(start: Date, end: Date) {
    if (start > end) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }
  }

  private enforceAdvanceRule(now: Date, start: Date) {
    const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 3) {
      throw new BadRequestException('Leave requests must be created at least 3 days before startDate');
    }
  }

  private async ensureNoOverlap(accountId: string, start: Date, end: Date, ignoreId?: string) {
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        accountId,
        status: LeaveStatus.APPROVED,
        id: ignoreId ? { not: ignoreId } : undefined,
        startDate: { lte: end },
        endDate: { gte: start }
      }
    });
    if (overlapping) {
      throw new ConflictException('Approved leave already exists for the overlapping dates');
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Leave request with id ${id ?? 'unknown'} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related account or branch not found');
      }
    }
    throw error;
  }
}
