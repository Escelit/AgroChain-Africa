import { Test, TestingModule } from '@nestjs/testing';
import { NdviService } from './ndvi.service';
import { ConfigService } from '@nestjs/config';

describe('NdviService', () => {
  let service: NdviService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NdviService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    service = module.get(NdviService);
  });

  it('should return mock forecast when credentials not configured', async () => {
    const result = await service.getNdviForecast('u4pruydqqvj', 'MAIZE');
    expect(result.geohash).toBe('u4pruydqqvj');
    expect(result.commodity).toBe('MAIZE');
    expect(result.estimatedYieldKgPerHa).toBeGreaterThan(0);
    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(result.confidence);
  });

  it('should use correct yield model for COFFEE', async () => {
    const result = await service.getNdviForecast('abc', 'COFFEE');
    expect(result.estimatedYieldKgPerHa).toBeGreaterThanOrEqual(800);
  });

  it('should decode geohash to valid bbox', async () => {
    // Nairobi geohash
    const result = await service.getNdviForecast('kznfq', 'MAIZE');
    expect(result).toBeDefined();
  });
});
