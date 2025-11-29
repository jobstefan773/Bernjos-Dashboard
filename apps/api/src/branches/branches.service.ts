import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({
        data: {
          ...createBranchDto,
          isActive: true
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(includeInactive = false) {
    return this.prisma.branch.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with id ${id} not found`);
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    try {
      return await this.prisma.branch.update({
        where: { id },
        data: updateBranchDto
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.branch.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Branch code must be unique');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Branch with id ${id ?? 'unknown'} not found`);
      }
    }
    throw error;
  }
}
