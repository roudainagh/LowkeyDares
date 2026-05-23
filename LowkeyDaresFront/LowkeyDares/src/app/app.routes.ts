import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],   // see guard below
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'challenges',
    canActivate: [authGuard],
    children: [
      {
        path: 'new',
        loadComponent: () => import('./features/challenges/new-challenge/new-challenge.component').then(m => m.NewChallengeComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/challenges/challenge-detail/challenge-detail.component').then(m => m.ChallengeDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
