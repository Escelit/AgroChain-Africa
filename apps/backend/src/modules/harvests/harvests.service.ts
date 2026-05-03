import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { HarvestStatus } from './entities/harvest-status.enum';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { Farmer } from '../farmers/entities/farmer.entity';
import { SorobanService } from '../../stellar/soroban.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HarvestsService {
  private readonly logger = new Logger(HarvestsService.name);

  constructor(
    @InjectRepository(Harvest) private harvestRepo: Repository<Harvest>,
    private sorobanService: SorobanService,
    private config: ConfigService,
  ) {}

  async create(farmer: Farmer, dto: CreateHarvestDto): Promise<Harvest> {
    const harvest = this.harvestRepo.create({
      ...dto,
      harvestDate: new Date(dto.harvestDate),
      farmerId: farmer.id,
      farmer,
      status: HarvestStatus.DRAFT,
    });
    return this.harvestRepo.save(harvest);
  }

  async tokenize(farmerId: string, harvestId: string): Promise<Harvest> {
    const harvest = await this.findOne(harvestId);
    if (harvest.farmerId !== farmerId) throw new ForbiddenException();
    if (harvest.status !== HarvestStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT harvests can be tokenized');
    }

    const contractId = this.config.get('HARVEST_TOKEN_CONTRACT_ID');
    const signerSecret = this.config.get('PLATFORM_SIGNER_SECRET');

    if (contractId && signerSecret) {
      try {
        const result = await this.sorobanService.invokeContract({
          contractId,
          method: 'create_batch',
          args: [
            this.sorobanService.buildAddressVal(harvest.farmer.stellarPublicKey),
            this.sorobanService.buildSymbolVal(harvest.commodity),
            this.sorobanService.buildSymbolVal(harvest.grade),
            this.sorobanService.buildU64Val(Math.round(harvest.weightKg)),
            this.sorobanService.buildStringVal(harvest.locationGeohash),
            this.sorobanService.buildU64Val(Math.floor(harvest.harvestDate.getTime() / 1000)),
          ],
          signerSecret,
        });
        harvest.stellarBatchId = result?.hash || `batch-${Date.now()}`;
        harvest.txHash = result?.hash;
      } catch (err) {
        this.logger.warn(`Soroban tokenize failed (using mock): ${err.message}`);
        harvest.stellarBatchId = `mock-batch-${Date.now()}`;
      }
    } else {
      harvest.stellarBatchId = `mock-batch-${Date.now()}`;
    }

    harvest.status = HarvestStatus.TOKENIZED;
    return this.harvestRepo.save(harvest);
  }

  async findAll(farmerId: string): Promise<Harvest[]> {
    return this.harvestRepo.find({ where: { farmerId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Harvest> {
    const harvest = await this.harvestRepo.findOne({ where: { id } });
    if (!harvest) throw new NotFoundException(`Harvest ${id} not found`);
    return harvest;
  }

  async findListed(): Promise<Harvest[]> {
    return this.harvestRepo.find({
      where: { status: HarvestStatus.LISTED },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: HarvestStatus): Promise<void> {
    await this.harvestRepo.update(id, { status });
  }
}
