import { Test, TestingModule } from '@nestjs/testing';
import { PayrollItemsService } from './payroll-items.service';

describe('PayrollItemsService', () => {
  let service: PayrollItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollItemsService],
    }).compile();

    service = module.get<PayrollItemsService>(PayrollItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
