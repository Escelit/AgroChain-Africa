import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StellarModule } from '../../stellar/stellar.module';
import { FarmersModule } from '../farmers/farmers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), StellarModule, FarmersModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
