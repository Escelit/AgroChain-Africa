import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowContract } from './entities/escrow-contract.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { StellarModule } from '../../stellar/stellar.module';
import { HarvestsModule } from '../harvests/harvests.module';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowContract]), StellarModule, HarvestsModule],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
