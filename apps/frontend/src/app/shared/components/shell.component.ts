import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <aside class="w-60 bg-green-900 text-white flex flex-col fixed h-full">
        <div class="px-6 py-5 border-b border-green-800">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌾</span>
            <span class="font-bold">AgroChain</span>
          </div>
          <p class="text-xs text-green-400 mt-0.5">Africa</p>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-1">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-green-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-green-800 transition-colors">
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="px-4 py-4 border-t border-green-800">
          <p class="text-xs text-green-400 font-mono truncate mb-2">
            {{ (auth.state$ | async)?.publicKey?.slice(0, 16) }}...
          </p>
          <button (click)="auth.logout()"
            class="w-full text-sm text-green-300 hover:text-white hover:bg-green-800 px-3 py-2 rounded-lg transition-colors text-left">
            🚪 Logout
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="ml-60 flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/harvests', icon: '🌱', label: 'Harvests' },
    { path: '/contracts', icon: '📋', label: 'Contracts' },
    { path: '/loans', icon: '💰', label: 'Loans' },
    { path: '/marketplace', icon: '🏪', label: 'Marketplace' },
    { path: '/payments', icon: '💳', label: 'Payments' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  constructor(public auth: AuthService) {}
}
