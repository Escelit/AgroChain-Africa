import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farmer } from './entities/farmer.entity';
import { CreateFarmerDto, UpdateFarmerDto } from './dto/farmer.dto';

@Injectable()
export class FarmersService {
  constructor(
    @InjectRepository(Farmer) private farmerRepo: Repository<Farmer>,
  ) {}

  async create(dto: CreateFarmerDto): Promise<Farmer> {
    const farmer = this.farmerRepo.create(dto);
    return this.farmerRepo.save(farmer);
  }

  async findById(id: string): Promise<Farmer> {
    const farmer = await this.farmerRepo.findOne({ where: { id } });
    if (!farmer) throw new NotFoundException(`Farmer ${id} not found`);
    return farmer;
  }

  async findByPublicKey(publicKey: string): Promise<Farmer | null> {
    return this.farmerRepo.findOne({ where: { stellarPublicKey: publicKey } });
  }

  async update(id: string, dto: UpdateFarmerDto): Promise<Farmer> {
    await this.farmerRepo.update(id, dto);
    return this.findById(id);
  }

  async updateCreditScore(id: string, score: number): Promise<void> {
    await this.farmerRepo.update(id, { onChainCreditScore: score });
  }
}
