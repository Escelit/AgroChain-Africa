import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WalletService } from './wallet.service';

export interface AuthState {
  accessToken: string | null;
  publicKey: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private state = new BehaviorSubject<AuthState>({ accessToken: null, publicKey: null });
  readonly state$ = this.state.asObservable();
  readonly isAuthenticated$ = this.state$.pipe(
    // map to boolean
    tap(() => {}),
  );

  constructor(private http: HttpClient, private wallet: WalletService) {
    const token = localStorage.getItem('access_token');
    const publicKey = localStorage.getItem('public_key');
    if (token && publicKey) {
      this.state.next({ accessToken: token, publicKey });
    }
  }

  async loginWithFreighter(): Promise<void> {
    const publicKey = await this.wallet.connect();

    const { transaction } = await this.http
      .post<{ challenge: string; transaction: string }>(
        `${environment.apiUrl}/auth/challenge`,
        { publicKey },
      )
      .toPromise() as any;

    const signedXdr = await this.wallet.signTransaction(transaction, environment.stellarNetwork);

    const { accessToken } = await this.http
      .post<{ accessToken: string }>(`${environment.apiUrl}/auth/verify`, {
        publicKey,
        signedXdr,
      })
      .toPromise() as any;

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('public_key', publicKey);
    this.state.next({ accessToken, publicKey });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('public_key');
    this.wallet.disconnect();
    this.state.next({ accessToken: null, publicKey: null });
  }

  getToken(): string | null {
    return this.state.getValue().accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.state.getValue().accessToken;
  }
}
