import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Request } from 'express';
import { Role, LeaveStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';

@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true
  })
)
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto, @Req() req: Request) {
    const user = req.user as { userId: string; role: Role; accountId: string };
    return this.leaveRequestsService.create(createLeaveRequestDto, user);
  }

  @Get()
  findAll(
    @Query('accountId') accountId: string,
    @Query('branchId') branchId: string,
    @Query('status') status?: LeaveStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: Request
  ) {
    const user = req?.user as { userId: string; role: Role; accountId: string };
    return this.leaveRequestsService.findAll({ accountId, branchId, status, startDate, endDate }, user);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    const user = req.user as { userId: string; role: Role; accountId: string };
    return this.leaveRequestsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Req() req: Request
  ) {
    const user = req.user as { userId: string; role: Role; accountId: string };
    return this.leaveRequestsService.update(id, updateLeaveRequestDto, user);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    const user = req.user as { role: Role };
    return this.leaveRequestsService.remove(id, user);
  }
}
