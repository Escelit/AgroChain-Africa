import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto, LoanStatus, RepayLoanDto } from './dto/loan.dto';
import { HarvestsService } from '../harvests/harvests.service';
import { FarmersService } from '../farmers/farmers.service';
import { SorobanService } from '../../stellar/soroban.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(Loan) private loanRepo: Repository<Loan>,
    private harvestsService: HarvestsService,
    private farmersService: FarmersService,
    private sorobanService: SorobanService,
    private config: ConfigService,
  ) {}

  async create(farmerId: string, dto: CreateLoanDto): Promise<Loan> {
    const harvest = await this.harvestsService.findOne(dto.harvestId);
    if (harvest.farmerId !== farmerId) throw new BadRequestException('Not your harvest');

    const farmer = await this.farmersService.findById(farmerId);
    if (farmer.onChainCreditScore < 300) {
      throw new BadRequestException('Credit score too low (minimum 300 required)');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dto.durationDays);

    const loan = this.loanRepo.create({
      ...dto,
      farmerId,
      farmer,
      harvestId: dto.harvestId,
      dueDate,
      status: LoanStatus.ACTIVE,
    });

    const saved = await this.loanRepo.save(loan);

    const contractId = this.config.get('LOAN_CONTRACT_ID');
    if (contractId) {
      try {
        const result = await this.sorobanService.invokeContract({
          contractId,
          method: 'create_loan',
          args: [
            this.sorobanService.buildAddressVal(dto.lenderPublicKey),
            this.sorobanService.buildAddressVal(farmer.stellarPublicKey),
            this.sorobanService.buildU64Val(0),
            this.sorobanService.buildI128Val(Math.round(dto.principalUsdc * 1e7)),
            this.sorobanService.buildU64Val(dto.interestBps),
            this.sorobanService.buildU64Val(dto.durationDays * 17280),
          ],
          signerSecret: this.config.get('PLATFORM_SIGNER_SECRET') || '',
        });
        await this.loanRepo.update(saved.id, { stellarLoanId: result?.hash, disburseTxHash: result?.hash });
      } catch (err) {
        this.logger.warn(`Soroban loan creation failed (mock): ${err.message}`);
      }
    }

    return saved;
  }

  async repay(farmerId: string, loanId: string, dto: RepayLoanDto): Promise<Loan> {
    const loan = await this.findOne(loanId);
    if (loan.farmerId !== farmerId) throw new BadRequestException('Not your loan');
    if (loan.status !== LoanStatus.ACTIVE) throw new BadRequestException('Loan not active');

    const totalDue = loan.principalUsdc * (1 + loan.interestBps / 10000);
    const newRepaid = Number(loan.repaidUsdc) + dto.amountUsdc;

    await this.loanRepo.update(loanId, {
      repaidUsdc: newRepaid,
      status: newRepaid >= totalDue ? LoanStatus.REPAID : LoanStatus.ACTIVE,
    });

    return this.findOne(loanId);
  }

  async findByFarmer(farmerId: string): Promise<Loan[]> {
    return this.loanRepo.find({ where: { farmerId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepo.findOne({ where: { id } });
    if (!loan) throw new NotFoundException(`Loan ${id} not found`);
    return loan;
  }

  async findByLender(lenderPublicKey: string): Promise<Loan[]> {
    return this.loanRepo.find({ where: { lenderPublicKey }, order: { createdAt: 'DESC' } });
  }
}
