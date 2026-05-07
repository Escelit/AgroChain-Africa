import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Withdraw to Mobile Money</h1>
      <p class="text-gray-500 text-sm mb-6">Convert your USDC to local currency via mobile money</p>

      @if (withdrawUrl()) {
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p class="font-semibold text-blue-800">Withdrawal Initiated</p>
          <p class="text-blue-600 text-sm mt-1 mb-4">Complete the process on your mobile money provider's page</p>
          <a [href]="withdrawUrl()" target="_blank"
            class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg inline-block transition-colors">
            Open Mobile Money Portal →
          </a>
          <button (click)="withdrawUrl.set('')" class="block mx-auto mt-3 text-sm text-blue-600 hover:underline">
            Start another withdrawal
          </button>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
            <input type="number" formControlName="amountUsdc" min="1"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. 50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Money Provider</label>
            <select formControlName="anchorId"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="mpesa">M-Pesa (Kenya, Tanzania)</option>
              <option value="mtn_momo">MTN MoMo (Ghana, Uganda, Nigeria)</option>
              <option value="flutterwave">Flutterwave (Multi-country)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input type="tel" formControlName="mobileNumber"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+254712345678" />
          </div>
          @if (error()) {
            <p class="text-red-600 text-sm">{{ error() }}</p>
          }
          <button type="submit" [disabled]="form.invalid || submitting()"
            class="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {{ submitting() ? 'Processing...' : '📱 Withdraw to Mobile Money' }}
          </button>
        </form>
      }
    </div>
  `,
})
export class WithdrawComponent {
  withdrawUrl = signal('');
  submitting = signal(false);
  error = signal('');

  form = this.fb.group({
    amountUsdc: [null as number | null, [Validators.required, Validators.min(1)]],
    anchorId: ['mpesa', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]],
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.http.post<{ url: string }>(`${environment.apiUrl}/payments/withdraw`, this.form.value).subscribe({
      next: res => { this.withdrawUrl.set(res.url); this.submitting.set(false); },
      error: err => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
