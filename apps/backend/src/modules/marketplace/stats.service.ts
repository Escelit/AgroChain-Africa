import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from '../harvests/entities/harvest.entity';
import { HarvestStatus } from '../harvests/entities/harvest-status.enum';
import { EscrowContract } from '../contracts/entities/escrow-contract.entity';
import { ContractStatus } from '../contracts/entities/contract-status.enum';

export interface PlatformStats {
  totalFarmers: number;
  totalHarvests: number;
  tokenizedHarvests: number;
  totalContractsValue: number;
  activeContracts: number;
  settledContracts: number;
  totalWeightKg: number;
}

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(Harvest) private harvestRepo: Repository<Harvest>,
    @InjectRepository(EscrowContract) private contractRepo: Repository<EscrowContract>,
  ) {}

  async getPlatformStats(): Promise<PlatformStats> {
    const [
      totalHarvests,
      tokenizedHarvests,
      activeContracts,
      settledContracts,
    ] = await Promise.all([
      this.harvestRepo.count(),
      this.harvestRepo.count({ where: { status: HarvestStatus.TOKENIZED } }),
      this.contractRepo.count({ where: { status: ContractStatus.FUNDED } }),
      this.contractRepo.count({ where: { status: ContractStatus.RELEASED } }),
    ]);

    const contractValueResult = await this.contractRepo
      .createQueryBuilder('c')
      .select('SUM(c.amountUsdc)', 'total')
      .where('c.status IN (:...statuses)', { statuses: [ContractStatus.FUNDED, ContractStatus.RELEASED] })
      .getRawOne();

    const weightResult = await this.harvestRepo
      .createQueryBuilder('h')
      .select('SUM(h.weightKg)', 'total')
      .getRawOne();

    return {
      totalFarmers: 0, // TODO: join with farmers table
      totalHarvests,
      tokenizedHarvests,
      totalContractsValue: Number(contractValueResult?.total || 0),
      activeContracts,
      settledContracts,
      totalWeightKg: Number(weightResult?.total || 0),
    };
  }
}
