import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { BranchesModule } from './branches/branches.module';

@Module({
  imports: [PrismaModule, BranchesModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
