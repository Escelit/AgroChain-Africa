import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FarmerService } from '../../../core/services/farmer.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Identity Verification</h1>
      <p class="text-gray-500 text-sm mb-6">
        KYC verification unlocks higher loan limits and enables mobile money withdrawals.
        Your national ID is hashed — we never store the raw number.
      </p>

      @if (verified()) {
        <div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <span class="text-4xl">✅</span>
          <p class="font-semibold text-green-800 mt-2">Identity Verified</p>
          <p class="text-green-600 text-sm mt-1">Your account is fully verified</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Legal Name</label>
            <input type="text" formControlName="fullName"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="As it appears on your ID" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">National ID Number</label>
            <input type="text" formControlName="nationalId"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your national ID or passport number" />
          </div>
          <p class="text-xs text-gray-400">
            🔒 Your ID number is immediately hashed with SHA-256. The raw number is never stored.
          </p>
          @if (error()) {
            <p class="text-red-600 text-sm">{{ error() }}</p>
          }
          <button type="submit" [disabled]="form.invalid || submitting()"
            class="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {{ submitting() ? 'Verifying...' : '🔐 Verify Identity' }}
          </button>
        </form>
      }
    </div>
  `,
})
export class KycComponent implements OnInit {
  verified = signal(false);
  submitting = signal(false);
  error = signal('');

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    nationalId: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private farmerService: FarmerService) {}

  ngOnInit() {
    this.farmerService.getMe().subscribe(p => this.verified.set(p.kycVerified));
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.http.post(`${environment.apiUrl}/farmers/me/kyc`, this.form.value).subscribe({
      next: () => { this.verified.set(true); this.submitting.set(false); },
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
