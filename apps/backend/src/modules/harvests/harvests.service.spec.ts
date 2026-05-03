import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsService } from './harvests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Harvest } from './entities/harvest.entity';
import { HarvestStatus } from './entities/harvest-status.enum';
import { SorobanService } from '../../stellar/soroban.service';
import { ConfigService } from '@nestjs/config';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('HarvestsService', () => {
  let service: HarvestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HarvestsService,
        { provide: getRepositoryToken(Harvest), useValue: mockRepo },
        { provide: SorobanService, useValue: { invokeContract: jest.fn(), buildAddressVal: jest.fn(), buildSymbolVal: jest.fn(), buildU64Val: jest.fn(), buildStringVal: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    service = module.get(HarvestsService);
  });

  it('should create a harvest in DRAFT status', async () => {
    const farmer = { id: 'f1', stellarPublicKey: 'GTEST' } as any;
    const dto = { commodity: 'MAIZE', grade: 'AA', weightKg: 500, locationGeohash: 'abc', harvestDate: '2025-12-01' };
    const expected = { ...dto, farmerId: 'f1', status: HarvestStatus.DRAFT };

    mockRepo.create.mockReturnValue(expected);
    mockRepo.save.mockResolvedValue(expected);

    const result = await service.create(farmer, dto as any);
    expect(result.status).toBe(HarvestStatus.DRAFT);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should tokenize a DRAFT harvest', async () => {
    const harvest = {
      id: 'h1', farmerId: 'f1', status: HarvestStatus.DRAFT,
      farmer: { stellarPublicKey: 'GTEST' }, commodity: 'MAIZE', grade: 'AA',
      weightKg: 500, locationGeohash: 'abc', harvestDate: new Date(),
    };
    mockRepo.findOne.mockResolvedValue(harvest);
    mockRepo.save.mockResolvedValue({ ...harvest, status: HarvestStatus.TOKENIZED, stellarBatchId: 'mock-batch-123' });

    const result = await service.tokenize('f1', 'h1');
    expect(result.status).toBe(HarvestStatus.TOKENIZED);
  });
});
