import { Injectable } from '@angular/core';
import { CanActivate, ExecutionContext, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  return router.createUrlTree(['/dashboard']);
};

import { inject } from '@angular/core';
