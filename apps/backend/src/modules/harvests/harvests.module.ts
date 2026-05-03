import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Harvest } from './entities/harvest.entity';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';
import { StellarModule } from '../../stellar/stellar.module';
import { FarmersModule } from '../farmers/farmers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest]), StellarModule, FarmersModule],
  providers: [HarvestsService],
  controllers: [HarvestsController],
  exports: [HarvestsService],
})
export class HarvestsModule {}
