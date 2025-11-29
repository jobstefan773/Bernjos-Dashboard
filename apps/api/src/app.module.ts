import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [PrismaModule, BranchesModule, AccountsModule, UsersModule, AuthModule, SchedulesModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
