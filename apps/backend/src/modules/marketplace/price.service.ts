import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StellarService } from '../../stellar/stellar.service';
import { Asset } from '@stellar/stellar-sdk';

export interface PriceQuote {
  sendAsset: string;
  receiveAsset: string;
  sendAmount: string;
  receiveAmount: string;
  rate: number;
  path: string[];
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    private stellarService: StellarService,
    private config: ConfigService,
  ) {}

  async getUsdcToLocalRate(
    localAssetCode: string,
    localAssetIssuer: string,
    amount: string,
  ): Promise<PriceQuote> {
    try {
      const server = this.stellarService.getServer();
      const usdcAsset = new Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN');
      const localAsset = new Asset(localAssetCode, localAssetIssuer);

      const paths = await server
        .strictReceivePaths([usdcAsset], localAsset, amount)
        .call();

      if (paths.records.length === 0) {
        return this.mockQuote(localAssetCode, amount);
      }

      const best = paths.records[0];
      return {
        sendAsset: 'USDC',
        receiveAsset: localAssetCode,
        sendAmount: best.source_amount,
        receiveAmount: amount,
        rate: Number(amount) / Number(best.source_amount),
        path: best.path.map((a: any) => a.asset_code || 'XLM'),
      };
    } catch (err) {
      this.logger.warn(`Path payment query failed: ${err.message}`);
      return this.mockQuote(localAssetCode, amount);
    }
  }

  private mockQuote(localAssetCode: string, amount: string): PriceQuote {
    const rates: Record<string, number> = {
      KES: 130, NGN: 1600, GHS: 15, TZS: 2700, UGX: 3800,
    };
    const rate = rates[localAssetCode] || 1;
    return {
      sendAsset: 'USDC',
      receiveAsset: localAssetCode,
      sendAmount: (Number(amount) / rate).toFixed(7),
      receiveAmount: amount,
      rate,
      path: [],
    };
  }
}
