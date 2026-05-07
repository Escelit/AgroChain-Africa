import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  Horizon,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private server: Horizon.Server;
  private network: string;

  constructor(private config: ConfigService) {
    const isTestnet = config.get('STELLAR_NETWORK') === 'testnet';
    this.server = new Horizon.Server(
      isTestnet
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org',
    );
    this.network = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  async createAccount(): Promise<{ publicKey: string; secretKey: string }> {
    const keypair = Keypair.random();
    if (this.config.get('STELLAR_NETWORK') === 'testnet') {
      await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
      this.logger.log(`Funded testnet account: ${keypair.publicKey()}`);
    }
    return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  }

  async loadAccount(publicKey: string) {
    return this.server.loadAccount(publicKey);
  }

  async sendPayment(
    sourceSecret: string,
    destinationPublicKey: string,
    asset: Asset,
    amount: string,
    memo?: string,
  ) {
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());
    const fee = String(await this.server.fetchBaseFee());

    const tx = new TransactionBuilder(sourceAccount, { fee, networkPassphrase: this.network })
      .addOperation(Operation.payment({ destination: destinationPublicKey, asset, amount }))
      .addMemo(memo ? Memo.text(memo) : Memo.none())
      .setTimeout(180)
      .build();

    tx.sign(sourceKeypair);
    return this.server.submitTransaction(tx);
  }

  async pathPayment(
    sourceSecret: string,
    sendAsset: Asset,
    sendMax: string,
    destination: string,
    destAsset: Asset,
    destAmount: string,
  ) {
    const keypair = Keypair.fromSecret(sourceSecret);
    const account = await this.server.loadAccount(keypair.publicKey());
    const fee = String(await this.server.fetchBaseFee());

    const paths = await this.server
      .strictReceivePaths([sendAsset], destAsset, destAmount)
      .call();

    const tx = new TransactionBuilder(account, { fee, networkPassphrase: this.network })
      .addOperation(
        Operation.pathPaymentStrictReceive({
          sendAsset,
          sendMax,
          destination,
          destAsset,
          destAmount,
          path: paths.records[0]?.path ?? [],
        }),
      )
      .setTimeout(180)
      .build();

    tx.sign(keypair);
    return this.server.submitTransaction(tx);
  }

  async buildChallengeTransaction(publicKey: string): Promise<string> {
    // SEP-10 challenge: a transaction the client must sign to prove key ownership
    const serverKeypair = Keypair.fromSecret(this.config.get('PLATFORM_SIGNER_SECRET') || Keypair.random().secret());
    const serverAccount = await this.server.loadAccount(serverKeypair.publicKey()).catch(() => null);
    if (!serverAccount) return '';

    const tx = new TransactionBuilder(serverAccount, {
      fee: '100',
      networkPassphrase: this.network,
    })
      .addOperation(
        Operation.manageData({
          name: 'agrochain-africa auth',
          value: Buffer.from(publicKey).toString('base64').slice(0, 64),
          source: publicKey,
        }),
      )
      .setTimeout(300)
      .build();

    tx.sign(serverKeypair);
    return tx.toEnvelope().toXDR('base64');
  }

  async verifyChallengeTransaction(signedXdr: string, _publicKey: string): Promise<boolean> {
    try {
      const { TransactionBuilder } = await import('@stellar/stellar-sdk');
      const tx = TransactionBuilder.fromXDR(signedXdr, this.network);
      const signers = (tx as any).signatures;
      return signers && signers.length > 0;
    } catch {
      return false;
    }
  }

  getNetwork(): string {
    return this.network;
  }

  getServer(): Horizon.Server {
    return this.server;
  }
}
