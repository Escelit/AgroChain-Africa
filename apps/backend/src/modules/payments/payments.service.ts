import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentType, PaymentStatus } from './entities/payment.entity';
import { AnchorService, AnchorId } from '../../stellar/anchor.service';
import { WithdrawDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private anchorService: AnchorService,
  ) {}

  async initiateWithdrawal(farmerId: string, farmerPublicKey: string, dto: WithdrawDto) {
    const { url, id } = await this.anchorService.initiateWithdrawal(
      farmerPublicKey,
      String(dto.amountUsdc),
      dto.anchorId as AnchorId,
      dto.mobileNumber,
    );

    const payment = this.paymentRepo.create({
      type: PaymentType.ANCHOR_WITHDRAWAL,
      status: PaymentStatus.PENDING,
      amountUsdc: dto.amountUsdc,
      anchorTransactionId: id,
      mobileNumber: dto.mobileNumber,
      farmerId,
    });
    await this.paymentRepo.save(payment);

    return { url, transactionId: id, paymentId: payment.id };
  }

  async getHistory(farmerId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async recordEscrowRelease(farmerId: string, amountUsdc: number, txHash: string): Promise<Payment> {
    const payment = this.paymentRepo.create({
      type: PaymentType.ESCROW_RELEASE,
      status: PaymentStatus.COMPLETED,
      amountUsdc,
      stellarTxHash: txHash,
      farmerId,
    });
    return this.paymentRepo.save(payment);
  }
}
