import { Test, TestingModule } from '@nestjs/testing';
import { PayRatesService } from './pay-rates.service';

describe('PayRatesService', () => {
  let service: PayRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayRatesService],
    }).compile();

    service = module.get<PayRatesService>(PayRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
