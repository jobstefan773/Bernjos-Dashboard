import { Test, TestingModule } from '@nestjs/testing';
import { PayrollItemsController } from './payroll-items.controller';
import { PayrollItemsService } from './payroll-items.service';

describe('PayrollItemsController', () => {
  let controller: PayrollItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollItemsController],
      providers: [PayrollItemsService],
    }).compile();

    controller = module.get<PayrollItemsController>(PayrollItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
