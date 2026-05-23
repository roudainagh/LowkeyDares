import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, FormsModule, NavbarComponent],
  template: `
    <app-navbar />

    <main class="page">
      <div class="page-header fade-up">
        <h1>⚔️ Warrior's profile</h1>
        <p class="page-sub">Your legend, your legacy</p>
      </div>

      <div class="card fade-up" *ngIf="profile()">
        <div class="avatar-row">
          <div class="avatar-lg">{{ initial() }}</div>
          <div>
            <div class="profile-name">{{ profile()!.username }}</div>
            <div class="profile-email">{{ profile()!.email }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="field">
          <label>🏷️ Battle name</label>
          <input [(ngModel)]="displayName" placeholder="Enter your warrior name" />
          <span class="field-hint">This is how others will see you in the arena</span>
        </div>

        <div class="form-footer">
          <span class="success-msg" *ngIf="saved()">✓ Legend updated!</span>
          <span class="error-msg" *ngIf="error()">⚠️ Something went wrong</span>
          <button class="btn-dare" (click)="save()" [disabled]="saving()">
            <span *ngIf="saving()" class="spinner-white"></span>
            <span *ngIf="!saving()">⚡ Forge changes ⚡</span>
          </button>
        </div>
      </div>

      <div *ngIf="!profile()" class="loading-row">
        <div class="spinner-orange"></div>
      </div>
    </main>
  `,
  styles: [`
    .page {
      max-width: 550px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      min-height: 100vh;
      background: radial-gradient(circle at 10% 30%, #121519, #020304);
    }

    .page-header { margin-bottom: 2rem; }
    .page-header h1 {
      font-size: 1.8rem;
      background: linear-gradient(135deg, #FFF5E6, #F45B2E);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }
    .page-sub {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 6px;
    }

    .card {
      background: #171A1F;
      border: 1px solid var(--border);
      border-radius: 32px;
      padding: 2rem;
      backdrop-filter: blur(10px);
    }

    .avatar-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 0.5rem;
    }

    .avatar-lg {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F45B2E, #D63E0E);
      color: white;
      font-size: 1.6rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(244, 91, 46, 0.3);
    }

    .profile-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text);
      font-family: var(--font-display);
    }

    .profile-email {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 1.75rem 0;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 1.75rem;
    }

    .field label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field input {
      background: #0E0F14;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 12px 16px;
      font-size: 0.95rem;
      color: var(--text);
      transition: all 0.2s;
    }

    .field input:focus {
      border-color: var(--blaze-orange);
      box-shadow: 0 0 0 3px rgba(244, 91, 46, 0.15);
      outline: none;
    }

    .field-hint {
      font-size: 0.7rem;
      color: var(--text-hint);
      margin-top: 4px;
    }

    .form-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 0.5rem;
    }

    .success-msg {
      font-size: 0.85rem;
      color: var(--success);
      font-weight: 600;
    }

    .error-msg {
      font-size: 0.85rem;
      color: var(--blaze-orange);
      font-weight: 600;
    }

    .btn-dare {
      background: linear-gradient(95deg, #F45B2E, #D63E0E);
      border: none;
      border-radius: 40px;
      padding: 10px 24px;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-dare:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(244, 91, 46, 0.4);
    }

    .btn-dare:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-row {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .spinner-orange {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(244, 91, 46, 0.2);
      border-top: 3px solid #F45B2E;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-white {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-up { animation: fadeUp 0.3s ease both; }
  `]
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  displayName = '';
  saving = signal(false);
  saved = signal(false);
  error = signal(false);

  constructor(
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe(p => {
      this.profile.set(p);
      this.displayName = p.username;
    });
  }

  initial() {
    return (this.profile()?.username?.[0] || '?').toUpperCase();
  }

  save() {
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(false);
    this.userService.updateProfile(this.displayName).subscribe({
      next: updated => {
        this.profile.set(updated);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.error.set(true);
      }
    });
  }
}
