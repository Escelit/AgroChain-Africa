import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTokenizedHarvests } from '../../store/harvests/harvests.selectors';
import { HarvestActions } from '../../store/harvests/harvests.actions';
import { ContractActions } from '../../store/contracts/contracts.actions';
import { Actions, ofType } from '@ngrx/effects';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-xl mx-auto px-6 py-8">
      <div class="mb-6">
        <a routerLink="/contracts" class="text-green-600 text-sm hover:underline">← Back to contracts</a>
        <h1 class="text-2xl font-bold text-gray-800 mt-2">Create Escrow Contract</h1>
        <p class="text-gray-500 text-sm mt-1">Lock in a buyer's payment before harvest</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Harvest</label>
          <select formControlName="harvestId"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Choose a tokenized harvest</option>
            @for (h of harvests$ | async; track h.id) {
              <option [value]="h.id">{{ h.commodity }} — {{ h.weightKg }}kg ({{ h.grade }})</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buyer Stellar Public Key</label>
          <input type="text" formControlName="buyerPublicKey"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            placeholder="G..." />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buyer Name (optional)</label>
          <input type="text" formControlName="buyerName"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g. Nairobi Grain Co." />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
            <input type="number" formControlName="amountUsdc" min="1"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. 2500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expected Weight (kg)</label>
            <input type="number" formControlName="expectedWeightKg" min="1"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. 500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contract Expiry Date</label>
          <input type="date" formControlName="expiryDate"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>

        @if (error()) {
          <p class="text-red-600 text-sm">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || loading()"
          class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
          {{ loading() ? 'Creating contract...' : '📋 Create Escrow Contract' }}
        </button>
      </form>
    </div>
  `,
})
export class CreateContractComponent implements OnInit {
  loading = signal(false);
  error = signal('');
  harvests$ = this.store.select(selectTokenizedHarvests);

  form = this.fb.group({
    harvestId: ['', Validators.required],
    buyerPublicKey: ['', [Validators.required, Validators.minLength(56)]],
    buyerName: [''],
    amountUsdc: [null as number | null, [Validators.required, Validators.min(1)]],
    expectedWeightKg: [null as number | null, [Validators.required, Validators.min(1)]],
    expiryDate: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router) {}

  ngOnInit() {
    this.store.dispatch(HarvestActions.loadHarvests());
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.store.dispatch(ContractActions.createContract({ dto: this.form.value as any }));
    try {
      await firstValueFrom(
        this.actions$.pipe(ofType(ContractActions.createContractSuccess, ContractActions.createContractFailure)),
      ).then(action => {
        if (action.type === ContractActions.createContractFailure.type) throw new Error((action as any).error);
      });
      this.router.navigate(['/contracts']);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }
}
