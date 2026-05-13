import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { LoanStatus } from './dto/loan.dto';
import { HarvestsService } from '../harvests/harvests.service';
import { FarmersService } from '../farmers/farmers.service';
import { SorobanService } from '../../stellar/soroban.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { HarvestStatus } from '../harvests/entities/harvest-status.enum';

const mockRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), update: jest.fn() };

describe('LoansService', () => {
  let service: LoansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: getRepositoryToken(Loan), useValue: mockRepo },
        { provide: HarvestsService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'h1', farmerId: 'f1', status: HarvestStatus.TOKENIZED }) } },
        { provide: FarmersService, useValue: { findById: jest.fn().mockResolvedValue({ id: 'f1', stellarPublicKey: 'GTEST', onChainCreditScore: 500 }) } },
        { provide: SorobanService, useValue: { invokeContract: jest.fn(), buildAddressVal: jest.fn(), buildI128Val: jest.fn(), buildU64Val: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    service = module.get(LoansService);
    jest.clearAllMocks();
  });

  it('should create a loan for eligible farmer', async () => {
    const loan = { id: 'l1', status: LoanStatus.ACTIVE, principalUsdc: 100 };
    mockRepo.create.mockReturnValue(loan);
    mockRepo.save.mockResolvedValue(loan);

    const result = await service.create('f1', { harvestId: 'h1', lenderPublicKey: 'GLENDER', principalUsdc: 100, interestBps: 500, durationDays: 90 });
    expect(result.status).toBe(LoanStatus.ACTIVE);
  });

  it('should reject loan for low credit score', async () => {
    const module = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: getRepositoryToken(Loan), useValue: mockRepo },
        { provide: HarvestsService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'h1', farmerId: 'f1', status: HarvestStatus.TOKENIZED }) } },
        { provide: FarmersService, useValue: { findById: jest.fn().mockResolvedValue({ id: 'f1', stellarPublicKey: 'GTEST', onChainCreditScore: 100 }) } },
        { provide: SorobanService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    const svc = module.get(LoansService);
    await expect(svc.create('f1', { harvestId: 'h1', lenderPublicKey: 'G', principalUsdc: 100, interestBps: 500, durationDays: 90 }))
      .rejects.toThrow(BadRequestException);
  });
});
