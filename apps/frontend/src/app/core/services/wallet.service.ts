import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class WalletService {
  private publicKeySubject = new BehaviorSubject<string | null>(null);
  readonly publicKey$ = this.publicKeySubject.asObservable();
  readonly connected$ = this.publicKey$.pipe(map(k => !!k));
  readonly connecting = signal(false);

  async connect(): Promise<string> {
    this.connecting.set(true);
    try {
      const freighter = await this.getFreighter();
      const connected = await freighter.isConnected();
      if (!connected) throw new Error('Please install the Freighter wallet extension.');

      const publicKey = await freighter.getPublicKey();
      this.publicKeySubject.next(publicKey);
      return publicKey;
    } finally {
      this.connecting.set(false);
    }
  }

  async signTransaction(xdr: string, network: 'TESTNET' | 'PUBLIC'): Promise<string> {
    const freighter = await this.getFreighter();
    return freighter.signTransaction(xdr, { networkPassphrase: network });
  }

  disconnect(): void {
    this.publicKeySubject.next(null);
  }

  getPublicKey(): string | null {
    return this.publicKeySubject.getValue();
  }

  private async getFreighter() {
    if (typeof window !== 'undefined' && window.freighter) {
      return window.freighter;
    }
    // Dynamic import for SSR safety
    return import('@stellar/freighter-api');
  }
}
