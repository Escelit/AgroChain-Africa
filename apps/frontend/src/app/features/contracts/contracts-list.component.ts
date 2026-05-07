import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContractsService, EscrowContract } from '../../../core/services/contracts.service';

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">My Contracts</h1>

      @if (loading) {
        <div class="text-center py-12 text-gray-400">Loading contracts...</div>
      } @else if (contracts.length === 0) {
        <div class="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span class="text-5xl">📋</span>
          <p class="mt-4 text-gray-500">No contracts yet. Tokenize a harvest and create an escrow contract.</p>
          <a routerLink="/harvests" class="mt-4 inline-block bg-green-700 text-white px-6 py-2 rounded-lg">
            Go to Harvests
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (contract of contracts; track contract.id) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-gray-800">Contract #{{ contract.id.slice(0, 8) }}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    Buyer: {{ contract.buyerName || contract.buyerPublicKey.slice(0, 12) }}...
                  </p>
                  <p class="text-sm text-gray-500">Amount: \${{ contract.amountUsdc }} USDC</p>
                  <p class="text-sm text-gray-500">Expected: {{ contract.expectedWeightKg }} kg</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                  [class]="statusClass(contract.status)">
                  {{ contract.status }}
                </span>
              </div>
              @if (contract.status === 'FUNDED') {
                <button (click)="dispute(contract.id)"
                  class="mt-3 text-sm text-red-600 hover:underline">
                  Raise Dispute
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ContractsListComponent implements OnInit {
  contracts: EscrowContract[] = [];
  loading = true;

  constructor(private contractsService: ContractsService) {}

  ngOnInit() {
    this.contractsService.getAll().subscribe({
      next: c => { this.contracts = c; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  dispute(id: string) {
    const reason = prompt('Describe the dispute reason:');
    if (reason) {
      this.contractsService.dispute(id, reason).subscribe(updated => {
        this.contracts = this.contracts.map(c => c.id === id ? updated : c);
      });
    }
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-600',
      FUNDED: 'bg-blue-100 text-blue-700',
      RELEASED: 'bg-green-100 text-green-700',
      DISPUTED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }
}
