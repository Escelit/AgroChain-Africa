import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowContract } from './entities/escrow-contract.entity';
import { ContractStatus } from './entities/contract-status.enum';
import { CreateContractDto, DisputeContractDto } from './dto/contract.dto';
import { HarvestsService } from '../harvests/harvests.service';
import { HarvestStatus } from '../harvests/entities/harvest-status.enum';
import { SorobanService } from '../../stellar/soroban.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @InjectRepository(EscrowContract) private contractRepo: Repository<EscrowContract>,
    private harvestsService: HarvestsService,
    private sorobanService: SorobanService,
    private config: ConfigService,
  ) {}

  async create(farmerId: string, dto: CreateContractDto): Promise<EscrowContract> {
    const harvest = await this.harvestsService.findOne(dto.harvestId);
    if (harvest.farmerId !== farmerId) throw new BadRequestException('Not your harvest');
    if (harvest.status !== HarvestStatus.TOKENIZED) {
      throw new BadRequestException('Harvest must be tokenized first');
    }

    const contract = this.contractRepo.create({
      ...dto,
      expiryDate: new Date(dto.expiryDate),
      farmerId,
      farmer: harvest.farmer,
      harvestId: dto.harvestId,
      harvest,
      status: ContractStatus.PENDING,
    });

    const saved = await this.contractRepo.save(contract);
    await this.harvestsService.updateStatus(dto.harvestId, HarvestStatus.PLEDGED);
    return saved;
  }

  async fund(contractId: string, buyerSecret: string): Promise<EscrowContract> {
    const contract = await this.findOne(contractId);
    if (contract.status !== ContractStatus.PENDING) {
      throw new BadRequestException('Contract is not in PENDING state');
    }

    const escrowContractId = this.config.get('ESCROW_CONTRACT_ID');
    if (escrowContractId && buyerSecret) {
      try {
        const result = await this.sorobanService.invokeContract({
          contractId: escrowContractId,
          method: 'fund',
          args: [
            this.sorobanService.buildAddressVal(contract.buyerPublicKey),
            this.sorobanService.buildAddressVal(contract.farmer.stellarPublicKey),
            this.sorobanService.buildAddressVal(this.config.get('ORACLE_PUBLIC_KEY') || ''),
            this.sorobanService.buildU64Val(BigInt(contract.id.replace(/-/g, '').slice(0, 15))),
            this.sorobanService.buildI128Val(Math.round(contract.amountUsdc * 1e7)),
            this.sorobanService.buildU64Val(17280), // ~1 day in ledgers
          ],
          signerSecret: buyerSecret,
        });
        contract.fundTxHash = result?.hash;
        contract.stellarContractId = result?.hash;
      } catch (err) {
        this.logger.warn(`Soroban fund failed (mock): ${err.message}`);
      }
    }

    contract.status = ContractStatus.FUNDED;
    return this.contractRepo.save(contract);
  }

  async confirmDelivery(contractId: string): Promise<EscrowContract> {
    const contract = await this.findByStellarId(contractId) || await this.findOne(contractId);
    contract.status = ContractStatus.RELEASED;
    contract.deliveryConfirmedAt = new Date();
    await this.harvestsService.updateStatus(contract.harvestId, HarvestStatus.SETTLED);
    return this.contractRepo.save(contract);
  }

  async flagDispute(contractId: string, reason: string): Promise<EscrowContract> {
    const contract = await this.findOne(contractId);
    contract.status = ContractStatus.DISPUTED;
    contract.disputeReason = reason;
    return this.contractRepo.save(contract);
  }

  async findOne(id: string): Promise<EscrowContract> {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException(`Contract ${id} not found`);
    return contract;
  }

  async findByStellarId(stellarId: string): Promise<EscrowContract | null> {
    return this.contractRepo.findOne({ where: { stellarContractId: stellarId } });
  }

  async findByFarmer(farmerId: string): Promise<EscrowContract[]> {
    return this.contractRepo.find({ where: { farmerId }, order: { createdAt: 'DESC' } });
  }
}
