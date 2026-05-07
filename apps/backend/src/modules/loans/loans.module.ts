import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { StellarModule } from '../../stellar/stellar.module';
import { HarvestsModule } from '../harvests/harvests.module';
import { FarmersModule } from '../farmers/farmers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), StellarModule, HarvestsModule, FarmersModule],
  providers: [LoansService],
  controllers: [LoansController],
  exports: [LoansService],
})
export class LoansModule {}
