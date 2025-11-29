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

  private readonly adminRoles: Role[] = [Role.ADMIN, Role.SUPERADMIN];

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
    if (!this.adminRoles.includes(currentUser.role)) {
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
    if (!this.adminRoles.includes(currentUser.role) && leave.accountId !== currentUser.accountId) {
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

    const start = updateLeaveRequestDto.startDate ? new Date(updateLeaveRequestDto.startDate) : existing.startDate;
    const end = updateLeaveRequestDto.endDate ? new Date(updateLeaveRequestDto.endDate) : existing.endDate;
    this.validateDates(start, end);

    const nextStatus = updateLeaveRequestDto.status ?? existing.status;
    await this.ensureUpdateAllowed(existing, currentUser, nextStatus, start, end, id);

    const data = this.buildUpdateData(updateLeaveRequestDto, existing, start, end, currentUser.userId);

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
    if (!this.adminRoles.includes(currentUser.role)) {
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

  private async ensureUpdateAllowed(
    existing: Prisma.LeaveRequestUncheckedCreateInput,
    currentUser: { userId: string; role: Role; accountId: string },
    nextStatus: LeaveStatus,
    start: Date,
    end: Date,
    id: string
  ) {
    const isAdmin = this.adminRoles.includes(currentUser.role);
    const isOwner = existing.accountId === currentUser.accountId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Not allowed to update this leave request');
    }

    if (!isAdmin && existing.status !== LeaveStatus.PENDING) {
      throw new ForbiddenException('Only pending requests can be edited');
    }

    if (nextStatus === LeaveStatus.APPROVED) {
      await this.ensureNoOverlap(existing.accountId, start, end, id);
    }
  }

  private buildUpdateData(
    dto: UpdateLeaveRequestDto,
    existing: Prisma.LeaveRequestUncheckedCreateInput,
    start: Date,
    end: Date,
    reviewerId: string
  ): Prisma.LeaveRequestUpdateInput {
    const data: Prisma.LeaveRequestUpdateInput = {
      branch: dto.branchId ? { connect: { id: dto.branchId } } : undefined,
      startDate: dto.startDate ? start : undefined,
      endDate: dto.endDate ? end : undefined,
      reason: dto.reason,
      status: dto.status,
      rejectionReason: dto.rejectionReason
    };

    if (dto.status && dto.status !== existing.status) {
      data.reviewedAt = new Date();
      data.reviewedById = reviewerId;

      if (dto.status === LeaveStatus.REJECTED && !dto.rejectionReason) {
        throw new BadRequestException('rejectionReason is required when rejecting');
      }
    }

    return data;
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
