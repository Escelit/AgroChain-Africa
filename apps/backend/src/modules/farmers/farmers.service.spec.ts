import { Test, TestingModule } from '@nestjs/testing';
import { FarmersService } from './farmers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Farmer } from './entities/farmer.entity';
import { NotFoundException } from '@nestjs/common';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('FarmersService', () => {
  let service: FarmersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmersService,
        { provide: getRepositoryToken(Farmer), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(FarmersService);
    jest.clearAllMocks();
  });

  it('should create a farmer', async () => {
    const farmer = { id: 'f1', stellarPublicKey: 'GTEST' };
    mockRepo.create.mockReturnValue(farmer);
    mockRepo.save.mockResolvedValue(farmer);
    const result = await service.create({ stellarPublicKey: 'GTEST' });
    expect(result.stellarPublicKey).toBe('GTEST');
  });

  it('should throw NotFoundException for missing farmer', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should return null for unknown public key', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    const result = await service.findByPublicKey('GUNKNOWN');
    expect(result).toBeNull();
  });

  it('should update farmer profile', async () => {
    const updated = { id: 'f1', stellarPublicKey: 'GTEST', fullName: 'Amara Diallo' };
    mockRepo.update.mockResolvedValue({});
    mockRepo.findOne.mockResolvedValue(updated);
    const result = await service.update('f1', { fullName: 'Amara Diallo' });
    expect(result.fullName).toBe('Amara Diallo');
  });
});
