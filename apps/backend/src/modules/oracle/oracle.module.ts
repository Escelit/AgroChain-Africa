import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OracleService } from './oracle.service';
import { OracleController } from './oracle.controller';
import { OracleProcessor } from './oracle.processor';
import { ContractsModule } from '../contracts/contracts.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'oracle-events' }),
    ContractsModule,
    NotificationsModule,
  ],
  providers: [OracleService, OracleProcessor],
  controllers: [OracleController],
  exports: [OracleService],
})
export class OracleModule {}
