import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { StellarService } from '../../stellar/stellar.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let stellarService: jest.Mocked<StellarService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
        {
          provide: StellarService,
          useValue: {
            buildChallengeTransaction: jest.fn().mockResolvedValue('mock-xdr'),
            verifyChallengeTransaction: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: FarmersService,
          useValue: {
            findByPublicKey: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 'farmer-1', stellarPublicKey: 'GTEST' }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    stellarService = module.get(StellarService);
  });

  it('should return a challenge', async () => {
    const result = await service.getChallenge('GTEST');
    expect(result.challenge).toBeDefined();
    expect(result.transaction).toBe('mock-xdr');
  });

  it('should verify and return access token', async () => {
    await service.getChallenge('GTEST');
    const result = await service.verifyAndLogin('GTEST', 'signed-xdr');
    expect(result.accessToken).toBe('mock-token');
  });

  it('should throw on invalid signature', async () => {
    stellarService.verifyChallengeTransaction.mockResolvedValue(false);
    await service.getChallenge('GTEST');
    await expect(service.verifyAndLogin('GTEST', 'bad-xdr')).rejects.toThrow(UnauthorizedException);
  });
});
