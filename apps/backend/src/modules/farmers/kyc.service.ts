import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KycResult {
  verified: boolean;
  nationalIdHash: string;
  verifiedAt: Date;
  provider: string;
}

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(private config: ConfigService) {}

  async verifyIdentity(
    farmerId: string,
    nationalId: string,
    fullName: string,
    countryCode: string,
  ): Promise<KycResult> {
    // In production: integrate Smile Identity, Onfido, or Jumio
    // For now: hash the national ID and mark as verified
    const crypto = await import('crypto');
    const nationalIdHash = crypto
      .createHash('sha256')
      .update(`${nationalId}:${countryCode}`)
      .digest('hex');

    this.logger.log(`KYC verification for farmer ${farmerId} (${countryCode})`);

    // Stub: always returns verified in dev
    return {
      verified: true,
      nationalIdHash,
      verifiedAt: new Date(),
      provider: 'stub',
    };
  }
}
