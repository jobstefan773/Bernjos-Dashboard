import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { PayRatesController } from './pay-rates.controller';
import { PayRatesService } from './pay-rates.service';

@Module({
  imports: [PrismaModule],
  controllers: [PayRatesController],
  providers: [PayRatesService]
})
export class PayRatesModule {}
