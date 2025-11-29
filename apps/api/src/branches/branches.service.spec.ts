import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { BranchesService } from './branches.service';

describe('BranchesService', () => {
  let service: BranchesService;
  const prismaServiceMock = {
    branch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        }
      ]
    }).compile();

    service = module.get<BranchesService>(BranchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
