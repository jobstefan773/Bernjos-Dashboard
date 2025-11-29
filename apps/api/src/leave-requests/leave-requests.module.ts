import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequestsController } from './leave-requests.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
