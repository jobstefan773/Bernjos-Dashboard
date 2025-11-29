import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendancesModule } from './attendances/attendances.module';
import { PayRatesModule } from './pay-rates/pay-rates.module';
import { PayrollPeriodsModule } from './payroll-periods/payroll-periods.module';
import { PayrollItemsModule } from './payroll-items/payroll-items.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';

@Module({
  imports: [PrismaModule, BranchesModule, AccountsModule, UsersModule, AuthModule, SchedulesModule, AttendancesModule, PayRatesModule, PayrollPeriodsModule, PayrollItemsModule, LeaveRequestsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
