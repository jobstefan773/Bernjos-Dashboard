import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreatePayRateDto } from './dto/create-pay-rate.dto';
import { UpdatePayRateDto } from './dto/update-pay-rate.dto';

@Injectable()
export class PayRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPayRateDto: CreatePayRateDto) {
    try {
      return await this.prisma.payRate.create({ data: createPayRateDto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(accountId?: string) {
    return this.prisma.payRate.findMany({
      where: accountId ? { accountId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const payRate = await this.prisma.payRate.findUnique({ where: { id } });
    if (!payRate) {
      throw new NotFoundException(`Pay rate with id ${id} not found`);
    }
    return payRate;
  }

  async update(id: string, updatePayRateDto: UpdatePayRateDto) {
    try {
      return await this.prisma.payRate.update({
        where: { id },
        data: updatePayRateDto
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.payRate.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A pay rate for this account already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Pay rate with id ${id ?? 'unknown'} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related account not found');
      }
    }
    throw error;
  }
}
