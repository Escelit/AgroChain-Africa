import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { HarvestActions } from '../../store/harvests/harvests.actions';
import { ContractActions } from '../../store/contracts/contracts.actions';
import { selectAllHarvests, selectHarvestsLoading } from '../../store/harvests/harvests.selectors';
import { selectAllContracts, selectActiveContracts } from '../../store/contracts/contracts.selectors';
import { AuthService } from '../../core/services/auth.service';
import { FarmerService, FarmerProfile } from '../../core/services/farmer.service';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-6 py-8">
      <!-- Welcome -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          Welcome back{{ profile()?.fullName ? ', ' + profile()!.fullName : '' }} 👋
        </h1>
        <p class="text-gray-500 text-sm mt-1">Here's your farm overview</p>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">Total Harvests</p>
          <p class="text-3xl font-bold text-green-700">{{ (harvests$ | async)?.length ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">On Stellar</p>
          <p class="text-3xl font-bold text-blue-600">
            {{ (harvests$ | async)?.filter(h => h.stellarBatchId)?.length ?? 0 }}
          </p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">Active Contracts</p>
          <p class="text-3xl font-bold text-orange-500">{{ (activeContracts$ | async)?.length ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">Credit Score</p>
          <p class="text-3xl font-bold text-purple-600">{{ profile()?.onChainCreditScore ?? '—' }}</p>
        </div>
      </div>

      <!-- Total value locked -->
      <div class="bg-gradient-to-r from-green-700 to-green-500 text-white rounded-xl p-6 mb-8">
        <p class="text-sm opacity-75">Total Value in Active Contracts</p>
        <p class="text-4xl font-bold mt-1">\${{ totalValueLocked() | number:'1.2-2' }} USDC</p>
        <p class="text-sm opacity-75 mt-1">Secured in Soroban escrow</p>
      </div>

      <!-- Quick actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <a routerLink="/harvests/new"
          class="bg-green-700 hover:bg-green-800 text-white rounded-xl p-5 flex items-center gap-4 transition-colors">
          <span class="text-3xl">🌱</span>
          <div><p class="font-semibold">New Harvest</p><p class="text-sm opacity-75">Tokenize a crop batch</p></div>
        </a>
        <a routerLink="/contracts/new"
          class="bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-5 flex items-center gap-4 transition-colors">
          <span class="text-3xl">📋</span>
          <div><p class="font-semibold">New Contract</p><p class="text-sm opacity-75">Lock in buyer price</p></div>
        </a>
        <a routerLink="/loans"
          class="bg-purple-700 hover:bg-purple-800 text-white rounded-xl p-5 flex items-center gap-4 transition-colors">
          <span class="text-3xl">💰</span>
          <div><p class="font-semibold">Get Financing</p><p class="text-sm opacity-75">Pre-harvest advance</p></div>
        </a>
      </div>

      <!-- Recent harvests -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 class="font-semibold text-gray-800">Recent Harvests</h2>
          <a routerLink="/harvests" class="text-sm text-green-600 hover:underline">View all →</a>
        </div>
        @if (loading$ | async) {
          <div class="p-8 text-center text-gray-400">Loading...</div>
        } @else if ((harvests$ | async)?.length === 0) {
          <div class="p-8 text-center text-gray-400">
            No harvests yet. <a routerLink="/harvests/new" class="text-green-600 underline">Create your first one</a>
          </div>
        } @else {
          <div class="divide-y divide-gray-50">
            @for (harvest of (harvests$ | async)?.slice(0, 5); track harvest.id) {
              <div class="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p class="font-medium text-gray-800">{{ harvest.commodity }} — {{ harvest.grade }}</p>
                  <p class="text-sm text-gray-500">{{ harvest.weightKg }} kg · {{ harvest.harvestDate | date }}</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full font-medium" [class]="statusClass(harvest.status)">
                  {{ harvest.status }}
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  harvests$ = this.store.select(selectAllHarvests);
  loading$ = this.store.select(selectHarvestsLoading);
  activeContracts$ = this.store.select(selectActiveContracts);
  profile = signal<FarmerProfile | null>(null);
  totalValueLocked = signal(0);

  constructor(public auth: AuthService, private store: Store, private farmerService: FarmerService) {}

  ngOnInit() {
    this.store.dispatch(HarvestActions.loadHarvests());
    this.store.dispatch(ContractActions.loadContracts());
    this.farmerService.getMe().subscribe(p => this.profile.set(p));
    this.activeContracts$.subscribe(contracts => {
      this.totalValueLocked.set(contracts.reduce((sum, c) => sum + Number(c.amountUsdc), 0));
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600', TOKENIZED: 'bg-blue-100 text-blue-700',
      LISTED: 'bg-yellow-100 text-yellow-700', PLEDGED: 'bg-orange-100 text-orange-700',
      DELIVERED: 'bg-green-100 text-green-700', SETTLED: 'bg-green-200 text-green-800',
      DISPUTED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }
}
