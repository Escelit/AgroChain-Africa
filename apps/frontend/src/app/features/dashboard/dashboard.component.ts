import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { HarvestActions } from '../../store/harvests/harvests.actions';
import { selectAllHarvests, selectHarvestsLoading } from '../../store/harvests/harvests.selectors';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🌾</span>
          <span class="font-bold text-lg">AgroChain Africa</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm opacity-75 font-mono">
            {{ (auth.state$ | async)?.publicKey | slice:0:8 }}...
          </span>
          <button (click)="auth.logout()" class="text-sm bg-green-700 hover:bg-green-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-6 py-8">
        <!-- Stats row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Total Harvests</p>
            <p class="text-3xl font-bold text-green-700">{{ (harvests$ | async)?.length ?? 0 }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Tokenized</p>
            <p class="text-3xl font-bold text-blue-600">
              {{ (harvests$ | async)?.filter(h => h.status !== 'DRAFT')?.length ?? 0 }}
            </p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Active Contracts</p>
            <p class="text-3xl font-bold text-orange-500">—</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Credit Score</p>
            <p class="text-3xl font-bold text-purple-600">—</p>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a routerLink="/harvests/new"
            class="bg-green-700 hover:bg-green-800 text-white rounded-xl p-6 flex items-center gap-4 transition-colors">
            <span class="text-3xl">🌱</span>
            <div>
              <p class="font-semibold">New Harvest</p>
              <p class="text-sm opacity-75">Tokenize a crop batch</p>
            </div>
          </a>
          <a routerLink="/contracts"
            class="bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-6 flex items-center gap-4 transition-colors">
            <span class="text-3xl">📋</span>
            <div>
              <p class="font-semibold">My Contracts</p>
              <p class="text-sm opacity-75">View escrow status</p>
            </div>
          </a>
          <a routerLink="/marketplace"
            class="bg-orange-600 hover:bg-orange-700 text-white rounded-xl p-6 flex items-center gap-4 transition-colors">
            <span class="text-3xl">🏪</span>
            <div>
              <p class="font-semibold">Marketplace</p>
              <p class="text-sm opacity-75">Browse harvest lots</p>
            </div>
          </a>
        </div>

        <!-- Recent harvests -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 class="font-semibold text-gray-800">Recent Harvests</h2>
            <a routerLink="/harvests" class="text-sm text-green-600 hover:underline">View all</a>
          </div>

          @if (loading$ | async) {
            <div class="p-8 text-center text-gray-400">Loading...</div>
          } @else if ((harvests$ | async)?.length === 0) {
            <div class="p-8 text-center text-gray-400">
              No harvests yet.
              <a routerLink="/harvests/new" class="text-green-600 underline ml-1">Create your first one</a>
            </div>
          } @else {
            <div class="divide-y divide-gray-50">
              @for (harvest of (harvests$ | async)?.slice(0, 5); track harvest.id) {
                <div class="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p class="font-medium text-gray-800">{{ harvest.commodity }} — {{ harvest.grade }}</p>
                    <p class="text-sm text-gray-500">{{ harvest.weightKg }} kg · {{ harvest.harvestDate | date }}</p>
                  </div>
                  <span class="text-xs px-2 py-1 rounded-full font-medium"
                    [class]="statusClass(harvest.status)">
                    {{ harvest.status }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  harvests$ = this.store.select(selectAllHarvests);
  loading$ = this.store.select(selectHarvestsLoading);

  constructor(public auth: AuthService, private store: Store) {}

  ngOnInit() {
    this.store.dispatch(HarvestActions.loadHarvests());
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      TOKENIZED: 'bg-blue-100 text-blue-700',
      LISTED: 'bg-yellow-100 text-yellow-700',
      PLEDGED: 'bg-orange-100 text-orange-700',
      DELIVERED: 'bg-green-100 text-green-700',
      SETTLED: 'bg-green-200 text-green-800',
      DISPUTED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }
}
