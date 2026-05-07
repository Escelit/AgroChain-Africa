import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto px-6 py-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Harvest Marketplace</h1>
        <p class="text-gray-500 text-sm mt-1">Browse tokenized harvest lots available for purchase</p>
      </div>

      @if (loading) {
        <div class="text-center py-12 text-gray-400">Loading marketplace...</div>
      } @else if (lots.length === 0) {
        <div class="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span class="text-5xl">🏪</span>
          <p class="mt-4 text-gray-500">No harvest lots listed yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (lot of lots; track lot.id) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-3">
                <span class="text-2xl">{{ commodityEmoji(lot.commodity) }}</span>
                <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{{ lot.grade }}</span>
              </div>
              <h3 class="font-semibold text-gray-800">{{ lot.commodity }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ lot.weightKg }} kg</p>
              @if (lot.estimatedValueUsdc) {
                <p class="text-lg font-bold text-green-700 mt-2">\${{ lot.estimatedValueUsdc }} USDC</p>
              }
              <p class="text-xs text-gray-400 mt-2">Harvest: {{ lot.harvestDate | date:'mediumDate' }}</p>
              <button class="mt-4 w-full bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition-colors">
                Make Offer
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MarketplaceComponent implements OnInit {
  lots: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/marketplace`).subscribe({
      next: lots => { this.lots = lots; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  commodityEmoji(commodity: string): string {
    const map: Record<string, string> = {
      MAIZE: '🌽', COFFEE: '☕', COCOA: '🍫',
      SOYBEAN: '🫘', CASSAVA: '🥔', WHEAT: '🌾', RICE: '🍚',
    };
    return map[commodity] || '🌱';
  }
}
