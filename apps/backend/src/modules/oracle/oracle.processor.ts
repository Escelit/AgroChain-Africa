import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ContractsService } from '../contracts/contracts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OracleDeliveryDto } from './dto/oracle.dto';

@Processor('oracle-events')
export class OracleProcessor {
  private readonly logger = new Logger(OracleProcessor.name);

  constructor(
    private contractsService: ContractsService,
    private notificationsService: NotificationsService,
  ) {}

  @Process('iot-delivery-confirmed')
  async handleDeliveryConfirm(job: Job<OracleDeliveryDto>) {
    const { contractId, sensorData } = job.data;
    this.logger.log(`Processing delivery for contract ${contractId}`);

    const contract = await this.contractsService.findOne(contractId).catch(() => null);
    if (!contract) {
      this.logger.warn(`Contract ${contractId} not found`);
      return;
    }

    const tolerance = Math.abs(sensorData.weightKg - contract.expectedWeightKg)
      / contract.expectedWeightKg;

    if (tolerance > 0.02) {
      await this.contractsService.flagDispute(
        contractId,
        `Weight mismatch: expected ${contract.expectedWeightKg}kg, got ${sensorData.weightKg}kg`,
      );
      this.logger.warn(`Dispute raised for contract ${contractId}`);
      return;
    }

    await this.contractsService.confirmDelivery(contractId);

    if (contract.farmer?.phone) {
      await this.notificationsService.sendSMS(
        contract.farmer.phone,
        `✅ Delivery confirmed. Your payment of $${contract.amountUsdc} USDC has been released.`,
      );
    }

    this.logger.log(`Contract ${contractId} settled successfully`);
  }
}
