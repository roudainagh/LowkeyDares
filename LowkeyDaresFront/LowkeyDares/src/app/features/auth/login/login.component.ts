import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="auth-shell">
      <div class="auth-brand">
        <div class="brand-mark">⚡</div>
        <span class="brand-name">LowkeyDares</span>
      </div>
      <div class="auth-card fade-up">
        <h1>enter the arena</h1>
        <p class="subtitle">Dare to show up. Login & continue your streak.</p>
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">EMAIL</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="dares@lowkey.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">PASSWORD</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>
          <div *ngIf="error()" class="form-error auth-error">{{ error() }}</div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
            <span *ngIf="loading()" class="spinner"></span>
            <span *ngIf="!loading()">⚡ SIGN IN & DARE ⚡</span>
          </button>
        </form>
        <p class="auth-switch">No battle armor? <a routerLink="/auth/register">Create account</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 10% 30%, #121519, #020304);
      padding: 2rem 1rem;
      position: relative;
    }
    .auth-shell::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBmaWxsPSIjRjQ1QjJFIiBmaWxsLW9wYWNpdHk9IjAuMDMiIGQ9Ik0yIDJoMzZ2MzZIMnoiLz48L3N2Zz4=');
      opacity: 0.2;
      pointer-events: none;
    }
    .auth-brand {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 2rem;
      z-index: 2;
    }
    .brand-mark {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #F45B2E, #E84A1A);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      box-shadow: 0 6px 14px rgba(244,91,46,0.3);
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(120deg, #FFF5E6, #F45B2E);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }
    .auth-card {
      background: rgba(23, 26, 31, 0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(244, 91, 46, 0.35);
      border-radius: 40px;
      padding: 2rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 35px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,91,46,0.12);
      z-index: 2;
    }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      background: linear-gradient(145deg, #FFFFFF, #FAD1B3);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #BCB8B0;
      font-weight: 450;
      margin-bottom: 2rem;
      font-size: 0.95rem;
      border-left: 3px solid #F45B2E;
      padding-left: 12px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #BCB8B0;
    }
    input {
      background: #0E0F14;
      border: 1.5px solid #282C34;
      border-radius: 20px;
      padding: 14px 18px;
      font-size: 1rem;
      color: #F5F2EB;
      font-weight: 500;
      transition: all 0.2s;
      outline: none;
      font-family: inherit;
    }
    input:focus {
      border-color: #F45B2E;
      box-shadow: 0 0 0 3px rgba(244, 91, 46, 0.25);
      background: #0B0D10;
    }
    input::placeholder {
      color: #4A4E58;
    }
    .auth-error {
      background: rgba(226, 88, 34, 0.15);
      border-left: 5px solid #F45B2E;
      color: #FFBC8C;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 0.85rem;
      font-weight: 500;
      margin: 4px 0;
    }
    .btn {
      background: linear-gradient(95deg, #F45B2E, #D63E0E);
      border: none;
      border-radius: 40px;
      padding: 14px 20px;
      font-weight: 700;
      font-size: 1rem;
      color: #FFFFFF;
      cursor: pointer;
      transition: 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 8px 20px rgba(244, 91, 46, 0.25);
    }
    .btn-full {
      width: 100%;
    }
    .btn:active {
      transform: scale(0.97);
    }
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,240,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      display: inline-block;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .auth-switch {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.9rem;
      color: #7F7B74;
    }
    .auth-switch a {
      color: #F45B2E;
      text-decoration: none;
      font-weight: 700;
      border-bottom: 1px dashed #F45B2E;
    }
    .auth-switch a:hover {
      color: #FFA164;
    }
    .fade-up {
      animation: fadeUp 0.45s ease-out;
    }
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const user = this.auth.currentUser();
        const role = user?.role;
        this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard']);
      },
      error: (e) => {
        this.error.set(e.error?.message || 'Invalid credentials');
        this.loading.set(false);
      }
    });
  }
}
