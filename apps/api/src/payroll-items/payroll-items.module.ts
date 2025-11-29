import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { PayrollItemsController } from './payroll-items.controller';
import { PayrollItemsService } from './payroll-items.service';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollItemsController],
  providers: [PayrollItemsService]
})
export class PayrollItemsModule {}
