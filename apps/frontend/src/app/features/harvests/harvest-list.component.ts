import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { HarvestActions } from '../../store/harvests/harvests.actions';
import { selectAllHarvests, selectHarvestsLoading } from '../../store/harvests/harvests.selectors';

@Component({
  selector: 'app-harvest-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">My Harvests</h1>
        <a routerLink="/harvests/new"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Harvest
        </a>
      </div>

      @if (loading$ | async) {
        <div class="text-center py-12 text-gray-400">Loading harvests...</div>
      } @else if ((harvests$ | async)?.length === 0) {
        <div class="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span class="text-5xl">🌱</span>
          <p class="mt-4 text-gray-500">No harvests yet. Start by tokenizing your first crop batch.</p>
          <a routerLink="/harvests/new" class="mt-4 inline-block bg-green-700 text-white px-6 py-2 rounded-lg">
            Create Harvest
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (harvest of harvests$ | async; track harvest.id) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex justify-between items-center">
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-gray-800">{{ harvest.commodity }} — Grade {{ harvest.grade }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="statusClass(harvest.status)">{{ harvest.status }}</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  {{ harvest.weightKg }} kg · {{ harvest.harvestDate | date:'mediumDate' }}
                  @if (harvest.estimatedValueUsdc) {
                    · ~\${{ harvest.estimatedValueUsdc }} USDC
                  }
                </p>
                @if (harvest.stellarBatchId) {
                  <p class="text-xs text-gray-400 font-mono mt-1">Batch: {{ harvest.stellarBatchId }}</p>
                }
              </div>
              <div class="flex gap-2">
                @if (harvest.status === 'DRAFT') {
                  <button (click)="tokenize(harvest.id)"
                    [disabled]="tokenizing() === harvest.id"
                    class="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
                    {{ tokenizing() === harvest.id ? 'Tokenizing...' : 'Tokenize' }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class HarvestListComponent implements OnInit {
  harvests$ = this.store.select(selectAllHarvests);
  loading$ = this.store.select(selectHarvestsLoading);
  tokenizing = signal<string | null>(null);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(HarvestActions.loadHarvests());
  }

  tokenize(id: string) {
    this.tokenizing.set(id);
    this.store.dispatch(HarvestActions.tokenizeHarvest({ id }));
    setTimeout(() => this.tokenizing.set(null), 3000);
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
