import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { ConfigService } from '@nestjs/config';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    service = module.get(SmsService);
  });

  it('should return mock result when API key not configured', async () => {
    const result = await service.send('+254712345678', 'Test message');
    expect(result.status).toBe('Success');
    expect(result.messageId).toMatch(/^mock-/);
  });

  it('should send bulk SMS without throwing', async () => {
    await expect(
      service.sendBulk(['+254712345678', '+234801234567'], 'Bulk test'),
    ).resolves.not.toThrow();
  });
});
