import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EscrowContract } from './entities/escrow-contract.entity';
import { ContractStatus } from './entities/contract-status.enum';
import { HarvestsService } from '../harvests/harvests.service';
import { SorobanService } from '../../stellar/soroban.service';
import { ConfigService } from '@nestjs/config';
import { HarvestStatus } from '../harvests/entities/harvest-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockHarvestsService = {
  findOne: jest.fn(),
  updateStatus: jest.fn(),
};

describe('ContractsService', () => {
  let service: ContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: getRepositoryToken(EscrowContract), useValue: mockRepo },
        { provide: HarvestsService, useValue: mockHarvestsService },
        { provide: SorobanService, useValue: { invokeContract: jest.fn(), buildAddressVal: jest.fn(), buildU64Val: jest.fn(), buildI128Val: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    service = module.get(ContractsService);
    jest.clearAllMocks();
  });

  it('should throw if harvest not owned by farmer', async () => {
    mockHarvestsService.findOne.mockResolvedValue({ farmerId: 'other', status: HarvestStatus.TOKENIZED, farmer: {} });
    await expect(service.create('farmer-1', { harvestId: 'h1', buyerPublicKey: 'G...', amountUsdc: 100, expectedWeightKg: 500, expiryDate: '2026-12-01' } as any))
      .rejects.toThrow(BadRequestException);
  });

  it('should throw if harvest not tokenized', async () => {
    mockHarvestsService.findOne.mockResolvedValue({ farmerId: 'farmer-1', status: HarvestStatus.DRAFT, farmer: {} });
    await expect(service.create('farmer-1', { harvestId: 'h1', buyerPublicKey: 'G...', amountUsdc: 100, expectedWeightKg: 500, expiryDate: '2026-12-01' } as any))
      .rejects.toThrow(BadRequestException);
  });

  it('should create contract and pledge harvest', async () => {
    const harvest = { id: 'h1', farmerId: 'farmer-1', status: HarvestStatus.TOKENIZED, farmer: { stellarPublicKey: 'GTEST' } };
    mockHarvestsService.findOne.mockResolvedValue(harvest);
    const expected = { id: 'c1', status: ContractStatus.PENDING };
    mockRepo.create.mockReturnValue(expected);
    mockRepo.save.mockResolvedValue(expected);

    const result = await service.create('farmer-1', { harvestId: 'h1', buyerPublicKey: 'GBUYER', amountUsdc: 500, expectedWeightKg: 500, expiryDate: '2026-12-01' } as any);
    expect(result.status).toBe(ContractStatus.PENDING);
    expect(mockHarvestsService.updateStatus).toHaveBeenCalledWith('h1', HarvestStatus.PLEDGED);
  });

  it('should throw NotFoundException for missing contract', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
