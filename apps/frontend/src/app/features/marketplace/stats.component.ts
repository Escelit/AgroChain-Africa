import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface PlatformStats {
  totalHarvests: number;
  tokenizedHarvests: number;
  totalContractsValue: number;
  activeContracts: number;
  settledContracts: number;
  totalWeightKg: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Platform Statistics</h1>

      @if (stats()) {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Total Harvests</p>
            <p class="text-3xl font-bold text-green-700">{{ stats()!.totalHarvests | number }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">On Stellar</p>
            <p class="text-3xl font-bold text-blue-600">{{ stats()!.tokenizedHarvests | number }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Active Contracts</p>
            <p class="text-3xl font-bold text-orange-500">{{ stats()!.activeContracts | number }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Settled Contracts</p>
            <p class="text-3xl font-bold text-green-600">{{ stats()!.settledContracts | number }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Total Value Locked</p>
            <p class="text-2xl font-bold text-purple-600">${{ stats()!.totalContractsValue | number:'1.0-0' }}</p>
            <p class="text-xs text-gray-400">USDC</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Total Crop Weight</p>
            <p class="text-2xl font-bold text-gray-700">{{ stats()!.totalWeightKg | number:'1.0-0' }}</p>
            <p class="text-xs text-gray-400">kg</p>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-400">Loading stats...</div>
      }
    </div>
  `,
})
export class StatsComponent implements OnInit {
  stats = signal<PlatformStats | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<PlatformStats>(`${environment.apiUrl}/marketplace/stats`).subscribe({
      next: s => this.stats.set(s),
    });
  }
}
