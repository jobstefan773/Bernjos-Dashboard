import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPeriodsService } from './payroll-periods.service';

describe('PayrollPeriodsService', () => {
  let service: PayrollPeriodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollPeriodsService],
    }).compile();

    service = module.get<PayrollPeriodsService>(PayrollPeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
