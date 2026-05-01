import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AnchorId = 'mpesa' | 'mtn_momo' | 'flutterwave';

@Injectable()
export class AnchorService {
  private readonly logger = new Logger(AnchorService.name);

  private readonly anchorUrls: Record<AnchorId, string>;

  constructor(private config: ConfigService) {
    this.anchorUrls = {
      mpesa: config.get('MPESA_ANCHOR_URL') || '',
      mtn_momo: config.get('MTN_MOMO_ANCHOR_URL') || '',
      flutterwave: config.get('FLUTTERWAVE_ANCHOR_URL') || '',
    };
  }

  async initiateWithdrawal(
    farmerPublicKey: string,
    amountUsdc: string,
    anchorId: AnchorId,
    mobileNumber: string,
  ): Promise<{ url: string; id: string }> {
    const anchorUrl = this.anchorUrls[anchorId];
    if (!anchorUrl) throw new Error(`Anchor ${anchorId} not configured`);

    // SEP-24 interactive withdrawal
    const response = await fetch(`${anchorUrl}/sep24/transactions/withdraw/interactive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_code: 'USDC',
        amount: amountUsdc,
        account: farmerPublicKey,
        extra_fields: { mobile_number: mobileNumber },
      }),
    });

    if (!response.ok) {
      throw new Error(`Anchor withdrawal failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.logger.log(`Withdrawal initiated for ${farmerPublicKey} via ${anchorId}: ${data.id}`);
    return { url: data.url, id: data.id };
  }

  async getWithdrawalStatus(anchorId: AnchorId, transactionId: string): Promise<any> {
    const anchorUrl = this.anchorUrls[anchorId];
    const response = await fetch(`${anchorUrl}/sep24/transaction?id=${transactionId}`);
    return response.json();
  }
}
