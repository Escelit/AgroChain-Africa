import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Payment {
  id: string;
  type: string;
  status: string;
  amountUsdc: number;
  stellarTxHash: string;
  mobileNumber: string;
  createdAt: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Payment History</h1>

      @if (loading()) {
        <div class="text-center py-12 text-gray-400">Loading payments...</div>
      } @else if (payments.length === 0) {
        <div class="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span class="text-5xl">💳</span>
          <p class="mt-4 text-gray-500">No payments yet.</p>
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          @for (p of payments; track p.id) {
            <div class="px-6 py-4 flex justify-between items-center">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ typeEmoji(p.type) }}</span>
                  <p class="font-medium text-gray-800">{{ typeLabel(p.type) }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="statusClass(p.status)">{{ p.status }}</span>
                </div>
                <p class="text-sm text-gray-500 mt-0.5">{{ p.createdAt | date:'medium' }}</p>
                @if (p.stellarTxHash) {
                  <p class="text-xs text-gray-400 font-mono mt-0.5">{{ p.stellarTxHash.slice(0, 20) }}...</p>
                }
              </div>
              <p class="text-lg font-bold" [class]="p.type === 'LOAN_DISBURSEMENT' ? 'text-green-600' : 'text-gray-800'">
                ${{ p.amountUsdc }} USDC
              </p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Payment[]>(`${environment.apiUrl}/payments/history`).subscribe({
      next: p => { this.payments = p; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  typeEmoji(type: string): string {
    const map: Record<string, string> = {
      ESCROW_RELEASE: '✅', LOAN_DISBURSEMENT: '💰',
      LOAN_REPAYMENT: '🔄', ANCHOR_WITHDRAWAL: '📱',
    };
    return map[type] || '💳';
  }

  typeLabel(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  statusClass(status: string): string {
    return status === 'COMPLETED' ? 'bg-green-100 text-green-700'
      : status === 'FAILED' ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';
  }
}
