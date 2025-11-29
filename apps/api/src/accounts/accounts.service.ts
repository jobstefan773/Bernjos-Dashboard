import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Department } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

interface AccountFilters {
  branchId?: string;
  department?: Department;
  activeOnly?: boolean;
}

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    const { branchId, dateHired, ...rest } = createAccountDto;
    const data: Prisma.AccountCreateInput = {
      ...rest,
      dateHired: dateHired ? new Date(dateHired) : undefined,
      isActive: createAccountDto.isActive ?? true,
      branch: branchId ? { connect: { id: branchId } } : undefined
    };

    try {
      return await this.prisma.account.create({ data });
    } catch (error) {
      this.handlePrismaError(error, branchId);
    }
  }

  findAll(filters: AccountFilters) {
    const { branchId, department, activeOnly = true } = filters;
    const where: Prisma.AccountWhereInput = {
      ...(activeOnly ? { isActive: true } : {}),
      ...(branchId ? { branchId } : {}),
      ...(department ? { department } : {})
    };

    return this.prisma.account.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const { branchId, dateHired, ...rest } = updateAccountDto;
    const data: Prisma.AccountUpdateInput = {
      ...rest,
      dateHired: dateHired ? new Date(dateHired) : undefined,
      branch: branchId === undefined ? undefined : branchId ? { connect: { id: branchId } } : { disconnect: true }
    };

    try {
      return await this.prisma.account.update({
        where: { id },
        data
      });
    } catch (error) {
      this.handlePrismaError(error, branchId, id);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.account.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error) {
      this.handlePrismaError(error, undefined, id);
    }
  }

  private handlePrismaError(error: unknown, branchId?: string, accountId?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) ?? [];
        const field = target.includes('email') ? 'email' : target.includes('code') ? 'code' : 'unique field';
        throw new ConflictException(`Account ${field} must be unique`);
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Account with id ${accountId ?? 'unknown'} not found`);
      }
      if (error.code === 'P2003' && branchId) {
        throw new NotFoundException(`Branch with id ${branchId} not found`);
      }
    }
    throw error;
  }
}
