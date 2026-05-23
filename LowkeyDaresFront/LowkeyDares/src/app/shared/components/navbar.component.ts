import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <nav class="navbar">
      <a routerLink="/dashboard" class="nav-brand">
        <span class="brand-mark">⚡</span>
        <span class="brand-name">LowkeyDares</span>
      </a>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Arena</a>
        <a *ngIf="isAdmin()" routerLink="/admin" routerLinkActive="active" class="nav-link">Forge</a>
        <a routerLink="/challenges/new" class="btn-dare btn-dare-sm">+ New Dare</a>
        <a routerLink="/profile" class="nav-avatar" title="My profile">
          {{ initial() }}
        </a>
        <button class="btn-ghost" (click)="auth.logout()">Exit</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 12, 15, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(244, 91, 46, 0.3);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 68px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      transition: transform 0.2s ease;
    }

    .nav-brand:hover {
      transform: scale(1.02);
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: linear-gradient(135deg, #F45B2E, #E84A1A);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 2px 8px rgba(244, 91, 46, 0.3);
    }

    .brand-name {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.2rem;
      background: linear-gradient(120deg, #FFF5E6, #F45B2E);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.3px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-link {
      color: #BCB8B0;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 30px;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: #F5F2EB;
      background: rgba(244, 91, 46, 0.12);
    }

    .nav-link.active {
      color: #F45B2E;
      background: rgba(244, 91, 46, 0.15);
      border: 1px solid rgba(244, 91, 46, 0.3);
    }

    .btn-dare {
      background: linear-gradient(95deg, #F45B2E, #D63E0E);
      border: none;
      border-radius: 40px;
      padding: 8px 18px;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(244, 91, 46, 0.25);
    }

    .btn-dare-sm {
      padding: 6px 16px;
      font-size: 0.85rem;
    }

    .btn-dare:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(244, 91, 46, 0.4);
      background: linear-gradient(95deg, #FF6B3C, #E84A1A);
    }

    .btn-ghost {
      background: transparent;
      border: 1px solid #2D2F36;
      border-radius: 30px;
      padding: 6px 16px;
      color: #BCB8B0;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-ghost:hover {
      border-color: #F45B2E;
      color: #F45B2E;
      background: rgba(244, 91, 46, 0.08);
    }

    .nav-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F45B2E, #E84A1A);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      box-shadow: 0 2px 6px rgba(244, 91, 46, 0.3);
    }

    .nav-avatar:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(244, 91, 46, 0.4);
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  initial() {
    return (this.auth.currentUser()?.username?.[0] || '?').toUpperCase();
  }

  isAdmin() {
    return this.auth.currentUser()?.role === 'ADMIN';
  }
}
