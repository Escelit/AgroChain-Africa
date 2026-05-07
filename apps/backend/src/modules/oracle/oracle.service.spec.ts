import { Test, TestingModule } from '@nestjs/testing';
import { OracleService } from './oracle.service';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

const mockQueue = { add: jest.fn() };

describe('OracleService', () => {
  let service: OracleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OracleService,
        { provide: getQueueToken('oracle-events'), useValue: mockQueue },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(OracleService);
    jest.clearAllMocks();
  });

  it('should enqueue a fresh delivery event', async () => {
    const payload = {
      contractId: 'c1',
      sensorData: { weightKg: 500, deviceId: 'dev-1', signature: 'sig', timestamp: Date.now() },
    };
    await service.verifyAndEnqueue(payload as any);
    expect(mockQueue.add).toHaveBeenCalledWith('iot-delivery-confirmed', payload, expect.any(Object));
  });

  it('should reject stale sensor data', async () => {
    const payload = {
      contractId: 'c1',
      sensorData: { weightKg: 500, deviceId: 'dev-1', signature: 'sig', timestamp: Date.now() - 400_000 },
    };
    await expect(service.verifyAndEnqueue(payload as any)).rejects.toThrow('Sensor data too old');
  });

  it('should return NDVI forecast stub', async () => {
    const result = await service.getNdviForecast('u4pruydqqvj', 'MAIZE');
    expect(result.geohash).toBe('u4pruydqqvj');
    expect(result.estimatedYieldKgPerHa).toBeGreaterThan(0);
  });
});
