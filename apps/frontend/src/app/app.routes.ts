import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'harvests',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/harvests/harvest-list.component').then(m => m.HarvestListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/harvests/create-harvest.component').then(m => m.CreateHarvestComponent),
      },
    ],
  },
  {
    path: 'contracts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/contracts/contracts-list.component').then(m => m.ContractsListComponent),
  },
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
