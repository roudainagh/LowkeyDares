import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ChallengeService } from '../../core/services/challenge.service';
import { InvitationService } from '../../core/services/invitation.service';
import { AuthService } from '../../core/services/auth.service';
import { Challenge, Invitation } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgClass, DatePipe, NavbarComponent],
  template: `
    <app-navbar />

    <main class="page">
      <!-- Hero greeting -->
      <section class="hero fade-up">
        <div class="hero-text">
          <h1>Hey, <span class="username-highlight">{{ username() }}</span> 👋</h1>
          <p class="hero-sub">Track your streaks. Beat your friends. Stay committed.</p>
        </div>
        <a routerLink="/challenges/new" class="btn-dare hero-cta">
          <span>+ New challenge</span>
        </a>
      </section>

      <!-- Pending invitations banner -->
      <section *ngIf="pendingInvitations().length > 0" class="invites-banner fade-up">
        <div class="invites-header">
          <div class="invite-icon">🔥</div>
          <div>
            <h3>You have {{ pendingInvitations().length }} pending invite{{ pendingInvitations().length > 1 ? 's' : '' }}</h3>
            <p>Friends want you to join their challenges</p>
          </div>
        </div>
        <div class="invite-cards">
          <div *ngFor="let inv of pendingInvitations()" class="invite-card">
            <div class="invite-info">
              <strong>{{ inv.challengeName }}</strong>
              <span>from <em>{{ inv.inviterUsername }}</em></span>
            </div>
            <div class="invite-actions">
              <button class="btn-dare-sm" (click)="respond(inv.id, true)" [disabled]="respondingId() === inv.id">
                Accept
              </button>
              <button class="btn-ghost-sm" (click)="respond(inv.id, false)" [disabled]="respondingId() === inv.id">
                Decline
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats row -->
      <section class="stats-row fade-up">
        <div class="stat-card">
          <span class="stat-label">Challenges created</span>
          <span class="stat-value">{{ createdChallenges().length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Challenges joined</span>
          <span class="stat-value">{{ joinedChallenges().length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total active</span>
          <span class="stat-value">{{ createdChallenges().length + joinedChallenges().length }}</span>
        </div>
      </section>

      <!-- My Challenges -->
      <section class="section fade-up">
        <div class="section-header">
          <h2>My challenges</h2>
          <a routerLink="/challenges/new" class="btn-ghost-sm">+ Create</a>
        </div>

        <div *ngIf="loadingChallenges()" class="loading-row">
          <div class="spinner-orange"></div>
        </div>

        <div *ngIf="!loadingChallenges() && createdChallenges().length === 0" class="empty-state">
          <div class="empty-icon">🎯</div>
          <p>No challenges yet. Start one and invite your friends!</p>
          <a routerLink="/challenges/new" class="btn-dare-sm">Create your first challenge</a>
        </div>

        <div class="challenge-grid" *ngIf="!loadingChallenges()">
          <a *ngFor="let c of createdChallenges(); let i = index" [routerLink]="['/challenges', c.id]"
             class="challenge-card" [style.animation-delay]="i * 60 + 'ms'">
            <div class="cc-top">
              <span class="badge-creator">Creator</span>
              <span class="cc-days">{{ c.daysPerWeek }}d/wk</span>
            </div>
            <h3 class="cc-name">{{ c.name }}</h3>
            <p class="cc-concept">{{ c.concept }}</p>
            <div class="cc-footer">
              <span class="cc-date">{{ c.startDate | date:'MMM d' }} → {{ c.endDate | date:'MMM d' }}</span>
              <div class="cc-days-chips">
                <span *ngFor="let d of c.activeDays" class="day-chip">{{ d.slice(0,2) }}</span>
              </div>
            </div>
          </a>
        </div>
      </section>

      <!-- Joined Challenges -->
      <section class="section fade-up" *ngIf="joinedChallenges().length > 0">
        <div class="section-header">
          <h2>Joined challenges</h2>
        </div>
        <div class="challenge-grid">
          <a *ngFor="let c of joinedChallenges(); let i = index" [routerLink]="['/challenges', c.id]"
             class="challenge-card" [style.animation-delay]="i * 60 + 'ms'">
            <div class="cc-top">
              <span class="badge-joined">Joined</span>
              <span class="cc-days">{{ c.daysPerWeek }}d/wk</span>
            </div>
            <h3 class="cc-name">{{ c.name }}</h3>
            <p class="cc-concept">{{ c.concept }}</p>
            <div class="cc-footer">
              <span class="cc-date">{{ c.startDate | date:'MMM d' }} → {{ c.endDate | date:'MMM d' }}</span>
              <div class="cc-days-chips">
                <span *ngFor="let d of c.activeDays" class="day-chip">{{ d.slice(0,2) }}</span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      min-height: 100vh;
      background: radial-gradient(circle at 10% 30%, #121519, #020304);
    }

    /* Hero section */
    .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
      background: rgba(23, 26, 31, 0.6);
      backdrop-filter: blur(10px);
      padding: 1.5rem 2rem;
      border-radius: 24px;
      border: 1px solid rgba(244, 91, 46, 0.2);
    }

    .hero-text h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #F5F2EB;
      margin-bottom: 8px;
    }

    .username-highlight {
      background: linear-gradient(135deg, #FFF5E6, #F45B2E);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-weight: 800;
      text-shadow: 0 0 15px rgba(244, 91, 46, 0.3);
    }

    .hero-sub {
      color: #BCB8B0;
      margin-top: 4px;
      font-size: 0.95rem;
    }

    .hero-cta {
      padding: 0.75rem 1.8rem;
      font-size: 0.95rem;
    }

    /* Invites banner */
    .invites-banner {
      background: rgba(244, 91, 46, 0.08);
      border: 1px solid rgba(244, 91, 46, 0.3);
      border-radius: 24px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }

    .invites-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
    }

    .invite-icon {
      font-size: 1.8rem;
    }

    .invites-header h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #F45B2E;
    }

    .invites-header p {
      font-size: 0.85rem;
      color: #BCB8B0;
      margin-top: 2px;
    }

    .invite-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .invite-card {
      background: #171A1F;
      border-radius: 18px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      border: 1px solid #2D2F36;
    }

    .invite-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .invite-info strong {
      font-size: 0.95rem;
      color: #F5F2EB;
    }

    .invite-info span {
      font-size: 0.8rem;
      color: #7F7B74;
    }

    .invite-actions {
      display: flex;
      gap: 10px;
    }

    /* Stats row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 2.5rem;
    }

    .stat-card {
      background: #171A1F;
      border: 1px solid #2D2F36;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: #F45B2E;
      transform: translateY(-2px);
    }

    .stat-label {
      font-size: 0.75rem;
      color: #9E9A92;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      color: #F45B2E;
    }

    /* Sections */
    .section {
      margin-bottom: 2.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .section-header h2 {
      font-size: 1.3rem;
      font-weight: 700;
      color: #F5F2EB;
    }

    /* Loading */
    .loading-row {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .spinner-orange {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(244, 91, 46, 0.2);
      border-top: 3px solid #F45B2E;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: #171A1F;
      border-radius: 24px;
      border: 1px dashed #2D2F36;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #9E9A92;
      margin-bottom: 1.25rem;
    }

    /* Challenge grid */
    .challenge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    .challenge-card {
      background: #171A1F;
      border: 1px solid #2D2F36;
      border-radius: 24px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      animation: fadeUp 0.3s ease both;
    }

    .challenge-card:hover {
      border-color: #F45B2E;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .cc-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .badge-creator {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 12px;
      background: rgba(244, 91, 46, 0.15);
      color: #F45B2E;
      border-radius: 30px;
      letter-spacing: 0.5px;
    }

    .badge-joined {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 12px;
      background: rgba(66, 185, 131, 0.15);
      color: #42B983;
      border-radius: 30px;
      letter-spacing: 0.5px;
    }

    .cc-days {
      font-size: 0.7rem;
      color: #9E9A92;
      background: #1A1D24;
      padding: 4px 10px;
      border-radius: 30px;
    }

    .cc-name {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 700;
      color: #F5F2EB;
      margin: 4px 0;
    }

    .cc-concept {
      font-size: 0.85rem;
      color: #9E9A92;
      line-height: 1.4;
    }

    .cc-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1px solid #2D2F36;
    }

    .cc-date {
      font-size: 0.7rem;
      color: #7F7B74;
    }

    .cc-days-chips {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .day-chip {
      font-size: 0.6rem;
      font-weight: 600;
      padding: 2px 8px;
      background: rgba(244, 91, 46, 0.12);
      color: #F45B2E;
      border-radius: 6px;
      text-transform: capitalize;
    }

    /* Buttons */
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
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(244, 91, 46, 0.25);
    }

    .btn-dare-sm {
      background: linear-gradient(95deg, #F45B2E, #D63E0E);
      border: none;
      border-radius: 30px;
      padding: 6px 16px;
      font-weight: 700;
      font-size: 0.8rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-dare:hover, .btn-dare-sm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(244, 91, 46, 0.4);
    }

    .btn-ghost-sm {
      background: transparent;
      border: 1px solid #2D2F36;
      border-radius: 30px;
      padding: 6px 16px;
      color: #BCB8B0;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-ghost-sm:hover {
      border-color: #F45B2E;
      color: #F45B2E;
      background: rgba(244, 91, 46, 0.05);
    }

    .btn-dare:disabled, .btn-dare-sm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Animations */
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-up {
      animation: fadeUp 0.4s ease-out;
    }
  `]
})
export class DashboardComponent implements OnInit {
  createdChallenges = signal<Challenge[]>([]);
  joinedChallenges = signal<Challenge[]>([]);
  pendingInvitations = signal<Invitation[]>([]);
  loadingChallenges = signal(true);
  respondingId = signal<number | null>(null);

  constructor(
    private challengeService: ChallengeService,
    private invitationService: InvitationService,
    private auth: AuthService
  ) {}

  username() {
    return this.auth.currentUser()?.username || 'there';
  }

  ngOnInit() {
    this.challengeService.getMyCreatedChallenges().subscribe(c => {
      this.createdChallenges.set(c);
      this.loadingChallenges.set(false);
    });
    this.challengeService.getMyJoinedChallenges().subscribe(c => this.joinedChallenges.set(c));
    this.invitationService.getMyPendingInvitations().subscribe(i => this.pendingInvitations.set(i));
  }

  respond(id: number, accept: boolean) {
    this.respondingId.set(id);
    this.invitationService.respondToInvitation(id, accept).subscribe({
      next: () => {
        this.pendingInvitations.update(list => list.filter(i => i.id !== id));
        this.respondingId.set(null);
        if (accept) this.challengeService.getMyJoinedChallenges().subscribe(c => this.joinedChallenges.set(c));
      },
      error: () => this.respondingId.set(null)
    });
  }
}
