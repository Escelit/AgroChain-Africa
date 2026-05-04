import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { HarvestsModule } from '../harvests/harvests.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
  imports: [HarvestsModule, OracleModule],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
