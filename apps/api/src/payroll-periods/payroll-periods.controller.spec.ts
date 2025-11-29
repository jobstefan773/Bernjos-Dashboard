import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPeriodsController } from './payroll-periods.controller';
import { PayrollPeriodsService } from './payroll-periods.service';

describe('PayrollPeriodsController', () => {
  let controller: PayrollPeriodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollPeriodsController],
      providers: [PayrollPeriodsService],
    }).compile();

    controller = module.get<PayrollPeriodsController>(PayrollPeriodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
