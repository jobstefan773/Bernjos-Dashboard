import { Test, TestingModule } from '@nestjs/testing';
import { PayRatesController } from './pay-rates.controller';
import { PayRatesService } from './pay-rates.service';

describe('PayRatesController', () => {
  let controller: PayRatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayRatesController],
      providers: [PayRatesService],
    }).compile();

    controller = module.get<PayRatesController>(PayRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
