import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 to-green-600">
      <div class="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <div class="mb-6">
          <span class="text-5xl">🌾</span>
          <h1 class="text-3xl font-bold text-green-800 mt-2">AgroChain Africa</h1>
          <p class="text-gray-500 mt-1">Decentralized Agricultural Supply Chain</p>
        </div>

        <p class="text-sm text-gray-600 mb-8">
          Connect your Stellar wallet to access the platform. Your keys, your crops, your payments.
        </p>

        <button
          (click)="connectWallet()"
          [disabled]="loading()"
          class="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {{ loading() ? 'Connecting...' : '🔗 Connect Freighter Wallet' }}
        </button>

        @if (error()) {
          <p class="mt-4 text-red-600 text-sm">{{ error() }}</p>
        }

        <p class="mt-6 text-xs text-gray-400">
          Don't have Freighter?
          <a href="https://freighter.app" target="_blank" class="text-green-600 underline">Install it here</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  async connectWallet() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.loginWithFreighter();
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Connection failed');
    } finally {
      this.loading.set(false);
    }
  }
}
