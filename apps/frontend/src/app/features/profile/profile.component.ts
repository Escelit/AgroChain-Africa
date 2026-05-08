import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FarmerService, FarmerProfile } from '../../../core/services/farmer.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      @if (profile()) {
        <!-- Credit score card -->
        <div class="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-xl p-6 mb-6">
          <p class="text-sm opacity-75">On-Chain Credit Score</p>
          <p class="text-5xl font-bold mt-1">{{ profile()!.onChainCreditScore }}</p>
          <p class="text-sm opacity-75 mt-1">/ 1000 · {{ creditLabel(profile()!.onChainCreditScore) }}</p>
          <div class="mt-3 bg-white/20 rounded-full h-2">
            <div class="bg-white rounded-full h-2 transition-all"
              [style.width.%]="profile()!.onChainCreditScore / 10"></div>
          </div>
        </div>

        <!-- Stellar key -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <p class="text-sm text-gray-500 mb-1">Stellar Public Key</p>
          <p class="font-mono text-xs text-gray-700 break-all">{{ profile()!.stellarPublicKey }}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs px-2 py-0.5 rounded-full"
              [class]="profile()!.kycVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
              {{ profile()!.kycVerified ? '✅ KYC Verified' : '⚠️ KYC Pending' }}
            </span>
          </div>
        </div>

        <!-- Edit form -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 class="font-semibold text-gray-800 mb-4">Edit Profile</h2>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" formControlName="fullName"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" formControlName="phone"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+254712345678" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select formControlName="countryCode"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="KE">Kenya</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
                <option value="TZ">Tanzania</option>
                <option value="UG">Uganda</option>
                <option value="ET">Ethiopia</option>
                <option value="CI">Côte d'Ivoire</option>
              </select>
            </div>
            @if (saved()) {
              <p class="text-green-600 text-sm">✅ Profile updated</p>
            }
            <button type="submit" [disabled]="saving()"
              class="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-400">Loading profile...</div>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  profile = signal<FarmerProfile | null>(null);
  saving = signal(false);
  saved = signal(false);

  form = this.fb.group({
    fullName: [''],
    phone: [''],
    countryCode: ['KE'],
  });

  constructor(private fb: FormBuilder, private farmerService: FarmerService) {}

  ngOnInit() {
    this.farmerService.getMe().subscribe(p => {
      this.profile.set(p);
      this.form.patchValue({ fullName: p.fullName, phone: p.phone, countryCode: p.countryCode });
    });
  }

  save() {
    this.saving.set(true);
    this.farmerService.updateMe(this.form.value as any).subscribe({
      next: p => { this.profile.set(p); this.saved.set(true); this.saving.set(false); setTimeout(() => this.saved.set(false), 3000); },
      error: () => this.saving.set(false),
    });
  }

  creditLabel(score: number): string {
    if (score >= 800) return 'Excellent';
    if (score >= 600) return 'Good';
    if (score >= 400) return 'Fair';
    if (score >= 200) return 'Poor';
    return 'No history';
  }
}
