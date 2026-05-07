import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { HarvestActions } from '../../store/harvests/harvests.actions';
import { firstValueFrom } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-create-harvest',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-xl mx-auto px-6 py-8">
      <div class="mb-6">
        <a href="/harvests" class="text-green-600 text-sm hover:underline">← Back to harvests</a>
        <h1 class="text-2xl font-bold text-gray-800 mt-2">Tokenize New Harvest</h1>
        <p class="text-gray-500 text-sm mt-1">Create an on-chain record of your crop batch on Stellar</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
          <select formControlName="commodity"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Select commodity</option>
            <option value="MAIZE">Maize</option>
            <option value="COFFEE">Coffee</option>
            <option value="COCOA">Cocoa</option>
            <option value="SOYBEAN">Soybean</option>
            <option value="CASSAVA">Cassava</option>
            <option value="WHEAT">Wheat</option>
            <option value="RICE">Rice</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <select formControlName="grade"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="AA">AA (Premium)</option>
            <option value="AB">AB (Standard)</option>
            <option value="B">B (Commercial)</option>
            <option value="C">C (Industrial)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input type="number" formControlName="weightKg" min="50"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g. 500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location (Geohash)</label>
          <input type="text" formControlName="locationGeohash"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g. u4pruydqqvj" />
          <p class="text-xs text-gray-400 mt-1">Use <a href="https://geohash.softeng.co" target="_blank" class="underline">geohash.softeng.co</a> to get your farm's geohash</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
          <input type="date" formControlName="harvestDate"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Value (USDC)</label>
          <input type="number" formControlName="estimatedValueUsdc" min="0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Optional" />
        </div>

        @if (error()) {
          <p class="text-red-600 text-sm">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || loading()"
          class="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
          {{ loading() ? 'Creating on Stellar...' : '🌱 Create Harvest Batch' }}
        </button>
      </form>
    </div>
  `,
})
export class CreateHarvestComponent {
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    commodity: ['', Validators.required],
    grade: ['AA', Validators.required],
    weightKg: [null as number | null, [Validators.required, Validators.min(50)]],
    locationGeohash: ['', Validators.required],
    harvestDate: ['', Validators.required],
    estimatedValueUsdc: [null as number | null],
  });

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private router: Router,
  ) {}

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.store.dispatch(HarvestActions.createHarvest({ dto: this.form.value as any }));

    try {
      await firstValueFrom(
        this.actions$.pipe(
          ofType(HarvestActions.createHarvestSuccess, HarvestActions.createHarvestFailure),
        ),
      ).then(action => {
        if (action.type === HarvestActions.createHarvestFailure.type) {
          throw new Error((action as any).error);
        }
      });
      this.router.navigate(['/harvests']);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }
}
