import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LoansService, Loan } from '../../../core/services/loans.service';
import { HarvestsService } from '../../../core/services/harvests.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Loans</h1>
        <button (click)="showForm.set(!showForm())"
          class="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {{ showForm() ? 'Cancel' : '+ Request Loan' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 class="font-semibold text-gray-800 mb-4">Request Pre-Harvest Loan</h2>
          <form [formGroup]="form" (ngSubmit)="requestLoan()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Harvest to Collateralize</label>
              <select formControlName="harvestId"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select harvest</option>
                @for (h of harvests; track h.id) {
                  <option [value]="h.id">{{ h.commodity }} — {{ h.weightKg }}kg</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lender Public Key</label>
              <input type="text" formControlName="lenderPublicKey"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="G..." />
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Principal (USDC)</label>
                <input type="number" formControlName="principalUsdc" min="10"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Interest (bps)</label>
                <input type="number" formControlName="interestBps" min="0" max="5000"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="500 = 5%" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input type="number" formControlName="durationDays" min="7"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <button type="submit" [disabled]="form.invalid || submitting()"
              class="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
              {{ submitting() ? 'Requesting...' : '💰 Request Loan' }}
            </button>
          </form>
        </div>
      }

      @if (loans.length === 0 && !loading()) {
        <div class="text-center py-12 bg-white rounded-xl border border-gray-100">
          <span class="text-5xl">💰</span>
          <p class="mt-4 text-gray-500">No loans yet. Request a pre-harvest advance against your tokenized crops.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (loan of loans; track loan.id) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-gray-800">\${{ loan.principalUsdc }} USDC</p>
                  <p class="text-sm text-gray-500 mt-1">
                    Interest: {{ loan.interestBps / 100 }}% · Due: {{ loan.dueDate | date:'mediumDate' }}
                  </p>
                  <div class="mt-2">
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Repaid: \${{ loan.repaidUsdc }}</span>
                      <span>Total: \${{ (loan.principalUsdc * (1 + loan.interestBps / 10000)).toFixed(2) }}</span>
                    </div>
                    <div class="bg-gray-100 rounded-full h-1.5">
                      <div class="bg-purple-600 rounded-full h-1.5"
                        [style.width.%]="(loan.repaidUsdc / (loan.principalUsdc * (1 + loan.interestBps / 10000))) * 100"></div>
                    </div>
                  </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                  [class]="loanStatusClass(loan.status)">{{ loan.status }}</span>
              </div>
              @if (loan.status === 'ACTIVE') {
                <button (click)="repay(loan)"
                  class="mt-3 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg transition-colors">
                  Make Repayment
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class LoansComponent implements OnInit {
  loans: Loan[] = [];
  harvests: any[] = [];
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);

  form = this.fb.group({
    harvestId: ['', Validators.required],
    lenderPublicKey: ['', [Validators.required, Validators.minLength(56)]],
    principalUsdc: [null as number | null, [Validators.required, Validators.min(10)]],
    interestBps: [500, [Validators.required, Validators.min(0), Validators.max(5000)]],
    durationDays: [90, [Validators.required, Validators.min(7)]],
  });

  constructor(private fb: FormBuilder, private loansService: LoansService, private harvestsService: HarvestsService) {}

  ngOnInit() {
    this.loansService.getAll().subscribe({ next: l => { this.loans = l; this.loading.set(false); }, error: () => this.loading.set(false) });
    this.harvestsService.getAll().subscribe(h => this.harvests = h.filter(x => x.status === 'TOKENIZED'));
  }

  requestLoan() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.loansService.create(this.form.value as any).subscribe({
      next: loan => { this.loans = [loan, ...this.loans]; this.showForm.set(false); this.submitting.set(false); },
      error: () => this.submitting.set(false),
    });
  }

  repay(loan: Loan) {
    const amount = Number(prompt(`Repayment amount (USDC):`));
    if (!amount || amount <= 0) return;
    this.loansService.repay(loan.id, amount).subscribe(updated => {
      this.loans = this.loans.map(l => l.id === updated.id ? updated : l);
    });
  }

  loanStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-blue-100 text-blue-700',
      REPAID: 'bg-green-100 text-green-700',
      DEFAULTED: 'bg-red-100 text-red-700',
      LIQUIDATED: 'bg-gray-100 text-gray-600',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }
}
