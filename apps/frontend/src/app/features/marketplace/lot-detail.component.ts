import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarketplaceService, MarketplaceLot } from '../../core/services/marketplace.service';

@Component({
  selector: 'app-lot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-8">
      <a routerLink="/marketplace" class="text-green-600 text-sm hover:underline">← Back to marketplace</a>

      @if (lot()) {
        <div class="mt-6">
          <!-- Header -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-2xl font-bold text-gray-800">
                  {{ lot()!.harvest.commodity }} — Grade {{ lot()!.harvest.grade }}
                </h1>
                <p class="text-gray-500 mt-1">{{ lot()!.harvest.weightKg }} kg · {{ lot()!.harvest.locationGeohash }}</p>
                <p class="text-gray-500 text-sm">Harvest: {{ lot()!.harvest.harvestDate | date:'mediumDate' }}</p>
              </div>
              @if (lot()!.harvest.estimatedValueUsdc) {
                <p class="text-2xl font-bold text-green-700">\${{ lot()!.harvest.estimatedValueUsdc }} USDC</p>
              }
            </div>
          </div>

          <!-- NDVI Forecast -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 class="font-semibold text-gray-800 mb-4">🛰️ Satellite Yield Forecast</h2>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-green-700">{{ lot()!.ndviForecast.estimatedYieldKgPerHa | number }}</p>
                <p class="text-xs text-gray-500 mt-1">kg/ha estimated yield</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600">{{ lot()!.ndviForecast.ndviScore }}</p>
                <p class="text-xs text-gray-500 mt-1">NDVI score</p>
              </div>
              <div class="text-center">
                <span class="text-sm px-3 py-1 rounded-full font-medium"
                  [class]="confidenceClass(lot()!.ndviForecast.confidence)">
                  {{ lot()!.ndviForecast.confidence }} confidence
                </span>
                <p class="text-xs text-gray-500 mt-2">Updated {{ lot()!.ndviForecast.updatedAt | date:'shortDate' }}</p>
              </div>
            </div>
          </div>

          <!-- Farmer info -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 class="font-semibold text-gray-800 mb-2">Farmer</h2>
            <p class="font-mono text-sm text-gray-600">{{ lot()!.harvest.farmer.stellarPublicKey }}</p>
            <p class="text-sm text-gray-500 mt-1">Country: {{ lot()!.harvest.farmer.countryCode }}</p>
          </div>

          <button class="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors">
            Make Purchase Offer
          </button>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-400 mt-6">Loading lot details...</div>
      }
    </div>
  `,
})
export class LotDetailComponent implements OnInit {
  lot = signal<MarketplaceLot | null>(null);

  constructor(private route: ActivatedRoute, private marketplaceService: MarketplaceService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.marketplaceService.getLot(id).subscribe(lot => this.lot.set(lot));
  }

  confidenceClass(confidence: string): string {
    return confidence === 'HIGH' ? 'bg-green-100 text-green-700'
      : confidence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';
  }
}
