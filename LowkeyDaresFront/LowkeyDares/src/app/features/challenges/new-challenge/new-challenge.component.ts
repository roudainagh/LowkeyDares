import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar.component';
import { ChallengeService } from '../../../core/services/challenge.service';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY:'Mo', TUESDAY:'Tu', WEDNESDAY:'We', THURSDAY:'Th',
  FRIDAY:'Fr', SATURDAY:'Sa', SUNDAY:'Su'
};

@Component({
  selector: 'app-new-challenge',
  standalone: true,
  imports: [FormsModule, RouterLink, NgFor, NgIf, NgClass, NavbarComponent],
  template: `
    <app-navbar />
    <main class="page">
      <div class="page-header fade-up">
        <a routerLink="/dashboard" class="back-link">← Arena</a>
        <h1>⚡ Forge a new dare</h1>
        <p class="sub">Define the battle. Invite warriors. Track glory.</p>
      </div>

      <div class="form-card fade-up">
        <form (ngSubmit)="onCreate()">
          <div class="form-group">
            <label class="form-label">Dare name *</label>
            <input [(ngModel)]="name" name="name" placeholder="e.g., 30-Day Dragon Slayer" required />
          </div>

          <div class="form-group">
            <label class="form-label">The challenge *</label>
            <textarea [(ngModel)]="concept" name="concept" rows="3"
              placeholder="What must warriors do to claim victory? Be specific."></textarea>
          </div>

          <div class="date-row">
            <div class="form-group">
              <label class="form-label">Start date *</label>
              <input type="date" [(ngModel)]="startDate" name="startDate" required />
            </div>
            <div class="form-group">
              <label class="form-label">End date *</label>
              <input type="date" [(ngModel)]="endDate" name="endDate" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Battle days *</label>
            <div class="day-picker">
              <button *ngFor="let day of days" type="button"
                class="day-btn" [class.active]="selectedDays.has(day)"
                (click)="toggleDay(day)">
                {{ dayLabel(day) }}
              </button>
            </div>
            <span class="day-count">
              {{ selectedDays.size }} day{{ selectedDays.size !== 1 ? 's' : '' }} per week
            </span>
          </div>

          <div *ngIf="error()" class="form-error">
            {{ error() }}
          </div>

          <div class="form-actions">
            <a routerLink="/dashboard" class="btn-ghost-sm">Cancel</a>
            <button type="submit" class="btn-dare" [disabled]="loading() || selectedDays.size === 0">
              <span *ngIf="loading()" class="spinner-white"></span>
              <span *ngIf="!loading()">⚡ Forge Dare ⚡</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  `,
  styles: [`
    .page {
      max-width: 650px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      min-height: 100vh;
      background: radial-gradient(circle at 10% 30%, #121519, #020304);
    }

    .page-header { margin-bottom: 2rem; }
    .back-link {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-decoration: none;
      display: inline-block;
      margin-bottom: 1rem;
      transition: all 0.2s;
    }
    .back-link:hover { color: var(--blaze-orange); }

    h1 {
      font-size: 2rem;
      margin-bottom: 6px;
      background: linear-gradient(135deg, #FFF5E6, #F45B2E);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    .sub { color: var(--text-muted); font-size: 0.9rem; }

    .form-card {
      background: #171A1F;
      border: 1px solid var(--border);
      border-radius: 32px;
      padding: 2rem;
      backdrop-filter: blur(10px);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 1.5rem;
    }

    .form-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input, textarea {
      background: #0E0F14;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 12px 16px;
      font-size: 0.95rem;
      color: var(--text);
      transition: all 0.2s;
    }

    input:focus, textarea:focus {
      border-color: var(--blaze-orange);
      box-shadow: 0 0 0 3px rgba(244, 91, 46, 0.15);
      outline: none;
    }

    textarea { resize: vertical; min-height: 90px; }

    .date-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .day-picker {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .day-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      background: #0E0F14;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .day-btn:hover {
      border-color: var(--blaze-orange);
      color: var(--blaze-orange);
      background: rgba(244, 91, 46, 0.1);
    }

    .day-btn.active {
      background: linear-gradient(135deg, #F45B2E, #D63E0E);
      border-color: var(--blaze-orange);
      color: white;
    }

    .day-count {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
      display: inline-block;
    }

    .form-error {
      background: rgba(244, 91, 46, 0.15);
      border-left: 3px solid var(--blaze-orange);
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.85rem;
      color: #FFBC8C;
      margin-bottom: 1.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 0.5rem;
    }

    .btn-dare {
      background: linear-gradient(95deg, #F45B2E, #D63E0E);
      border: none;
      border-radius: 40px;
      padding: 12px 28px;
      font-weight: 700;
      font-size: 0.9rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-dare:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(244, 91, 46, 0.4);
    }

    .btn-dare:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-ghost-sm {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 40px;
      padding: 12px 24px;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-ghost-sm:hover {
      border-color: var(--blaze-orange);
      color: var(--blaze-orange);
    }

    .spinner-white {
      display: inline-block;
      width: 18px;
      height: 18px;
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
export class NewChallengeComponent {
  name = '';
  concept = '';
  startDate = '';
  endDate = '';
  selectedDays = new Set<string>();
  loading = signal(false);
  error = signal('');
  days = DAYS;

  constructor(private challengeService: ChallengeService, private router: Router) {}

  dayLabel(day: string) { return DAY_LABELS[day]; }

  toggleDay(day: string) {
    this.selectedDays.has(day) ? this.selectedDays.delete(day) : this.selectedDays.add(day);
  }

  onCreate() {
    if (!this.name || !this.startDate || !this.endDate || this.selectedDays.size === 0) {
      this.error.set('Fill all fields and select at least one battle day.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.challengeService.createChallenge({
      name: this.name,
      concept: this.concept,
      startDate: this.startDate,
      endDate: this.endDate,
      activeDays: Array.from(this.selectedDays)
    }).subscribe({
      next: (c) => this.router.navigate(['/challenges', c.id]),
      error: (e) => {
        this.error.set(e.error?.message || 'Failed to create dare');
        this.loading.set(false);
      }
    });
  }
}
