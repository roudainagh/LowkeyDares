// admin.guard.ts
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = (): boolean | UrlTree => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'ADMIN') return true;
  return router.createUrlTree(['/dashboard']);
};
