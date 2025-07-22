import { Injectable, ConflictException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Check for unique department name
    const existing = await this.prisma.department.findUnique({ where: { name: createDepartmentDto.deptName } });
    if (existing) {
      throw new ConflictException('A department with this name already exists.');
    }

    // Create department (positions not included in DTO)
    return this.prisma.department.create({
      data: {
        name: createDepartmentDto.deptName,
      },
    });
  }

  async findAll() {
    // Validate: Ensure no duplicate department names (should be enforced by DB, but double-check for safety)
    const departments = await this.prisma.department.findMany({
      include: {
        positions: {
          include: {
            users: true,
          },
        },
      },
    });

    // Check for duplicate department names in result (should not happen if DB is correct)
    const nameSet = new Set();
    for (const dept of departments) {
      if (nameSet.has(dept.name)) {
        throw new ConflictException(`Duplicate department name found: ${dept.name}`);
      }
      nameSet.add(dept.name);
    }

    // Validate: Each position name is unique within its department
    for (const dept of departments) {
      if (dept.positions) {
        const posNameSet = new Set();
        for (const pos of dept.positions) {
          if (posNameSet.has(pos.name)) {
            throw new ConflictException(`Duplicate position name '${pos.name}' found in department '${dept.name}'.`);
          }
          posNameSet.add(pos.name);
        }
      }
    }

    return departments;
  }

  findOne(id: number) {
    return `This action returns a #${id} department`;
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }
}
