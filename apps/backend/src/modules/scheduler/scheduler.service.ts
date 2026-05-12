import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EscrowContract } from '../contracts/entities/escrow-contract.entity';
import { ContractStatus } from '../contracts/entities/contract-status.enum';
import { Loan } from '../loans/entities/loan.entity';
import { LoanStatus } from '../loans/dto/loan.dto';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(EscrowContract) private contractRepo: Repository<EscrowContract>,
    @InjectRepository(Loan) private loanRepo: Repository<Loan>,
    @InjectQueue('oracle-events') private oracleQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredContracts(): Promise<void> {
    const expired = await this.contractRepo.find({
      where: { status: ContractStatus.FUNDED, expiryDate: LessThan(new Date()) },
    });

    for (const contract of expired) {
      await this.contractRepo.update(contract.id, { status: ContractStatus.EXPIRED });
      this.logger.log(`Contract ${contract.id} marked as EXPIRED`);
    }

    if (expired.length > 0) {
      this.logger.log(`Expired ${expired.length} contracts`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueLoans(): Promise<void> {
    const overdue = await this.loanRepo.find({
      where: { status: LoanStatus.ACTIVE, dueDate: LessThan(new Date()) },
    });

    for (const loan of overdue) {
      await this.loanRepo.update(loan.id, { status: LoanStatus.DEFAULTED });
      this.logger.log(`Loan ${loan.id} marked as DEFAULTED`);
    }

    if (overdue.length > 0) {
      this.logger.log(`Defaulted ${overdue.length} overdue loans`);
    }
  }
}
