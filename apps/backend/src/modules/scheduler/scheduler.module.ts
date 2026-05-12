import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from './scheduler.service';
import { EscrowContract } from '../contracts/entities/escrow-contract.entity';
import { Loan } from '../loans/entities/loan.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([EscrowContract, Loan]),
    BullModule.registerQueue({ name: 'oracle-events' }),
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
