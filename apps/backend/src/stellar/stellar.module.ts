import { Module } from '@nestjs/common';
import { StellarService } from './stellar.service';
import { SorobanService } from './soroban.service';
import { AnchorService } from './anchor.service';

@Module({
  providers: [StellarService, SorobanService, AnchorService],
  exports: [StellarService, SorobanService, AnchorService],
})
export class StellarModule {}
