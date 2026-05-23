import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar.component';
import { ChallengeService } from '../../../core/services/challenge.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { StatsService } from '../../../core/services/stats.service';
import { AuthService } from '../../../core/services/auth.service';
import { Challenge, ChecklistEntry, LeaderboardResponse, Invitation } from '../../../shared/models';

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgClass, DatePipe, DecimalPipe, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="page" *ngIf="challenge()">

      <!-- Header -->
      <div class="ch-header fade-up">
        <a routerLink="/dashboard" class="back-link">← Arena</a>
        <div class="ch-title-row">
          <div>
            <h1>{{ challenge()!.name }}</h1>
            <p class="ch-concept">{{ challenge()!.concept }}</p>
          </div>
          <div class="ch-meta">
            <span class="badge badge-orange" *ngIf="isCreator()">Dare Master</span>
            <span class="badge badge-success" *ngIf="!isCreator()">Warrior</span>
            <span class="badge badge-dim">{{ challenge()!.daysPerWeek }}d/wk</span>
          </div>
        </div>
        <div class="ch-dates">
          📅 {{ challenge()!.startDate | date:'MMM d, yyyy' }} → {{ challenge()!.endDate | date:'MMM d, yyyy' }}
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs fade-up">
        <button class="tab" [class.active]="activeTab() === 'checklist'" (click)="activeTab.set('checklist')">
          ✅ Daily Dares
        </button>
        <button class="tab" [class.active]="activeTab() === 'leaderboard'" (click)="loadLeaderboard(); activeTab.set('leaderboard')">
          🏆 Glory Board
        </button>
        <button class="tab" [class.active]="activeTab() === 'invite'" (click)="activeTab.set('invite')" *ngIf="isCreator()">
          🔥 Summon
        </button>
      </div>

      <!-- Checklist tab -->
      <div *ngIf="activeTab() === 'checklist'" class="tab-panel fade-up">
        <div *ngIf="loadingChecklist()" class="loading-row"><div class="spinner-orange"></div></div>

        <div *ngIf="!loadingChecklist()">
          <!-- Stats summary -->
          <div class="cl-stats">
            <div class="cl-stat">
              <span class="cl-stat-val orange">{{ completedCount() }}</span>
              <span class="cl-stat-label">Conquered</span>
            </div>
            <div class="cl-stat">
              <span class="cl-stat-val">{{ checklist().length }}</span>
              <span class="cl-stat-label">Total</span>
            </div>
            <div class="cl-stat">
              <span class="cl-stat-val warning">{{ completionRate() | number:'1.0-0' }}%</span>
              <span class="cl-stat-label">Strength</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="completionRate()"></div>
              </div>
            </div>
          </div>

          <!-- Dot grid grouped by month -->
          <div *ngFor="let group of groupedChecklist()" class="cl-month">
            <h3 class="month-label">{{ group.month }}</h3>
            <div class="dot-grid">
              <button *ngFor="let entry of group.entries"
                class="dot" [class.completed]="entry.completed"
                [title]="entry.entryDate"
                (click)="toggleEntry(entry)">
                <span *ngIf="entry.completed">✓</span>
                <span *ngIf="!entry.completed" class="dot-date">{{ getDayNum(entry.entryDate) }}</span>
              </button>
            </div>
          </div>

          <div *ngIf="checklist().length === 0" class="empty-state">
            <div class="empty-icon">⚔️</div>
            <p>No battles scheduled yet. The challenge hasn't begun.</p>
          </div>
        </div>
      </div>

      <!-- Leaderboard tab -->
      <div *ngIf="activeTab() === 'leaderboard'" class="tab-panel fade-up">
        <div *ngIf="loadingLeaderboard()" class="loading-row"><div class="spinner-orange"></div></div>

        <div *ngIf="!loadingLeaderboard() && leaderboard()">
          <div class="lb-list">
            <div *ngFor="let entry of leaderboard()!.leaderboard; let i = index"
              class="lb-row" [class.top]="i === 0" [class.mine]="isMe(entry.userId)">
              <div class="lb-rank">
                <span *ngIf="i === 0">👑</span>
                <span *ngIf="i === 1">🥈</span>
                <span *ngIf="i === 2">🥉</span>
                <span *ngIf="i > 2">{{ entry.rank }}</span>
              </div>
              <div class="lb-user">
                <div class="lb-avatar">{{ entry.username[0].toUpperCase() }}</div>
                <div class="lb-info">
                  <strong>{{ entry.username }}</strong>
                  <span>{{ entry.completedDays }} / {{ entry.totalDays }} days</span>
                </div>
              </div>
              <div class="lb-right">
                <div class="lb-rate">{{ entry.completionRate | number:'1.0-0' }}%</div>
                <div class="lb-bar">
                  <div class="lb-bar-fill" [style.width.%]="entry.completionRate"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invite tab (creator only) -->
      <div *ngIf="activeTab() === 'invite' && isCreator()" class="tab-panel fade-up">
        <div class="invite-section card">
          <h3>🔥 Summon a warrior</h3>
          <p class="invite-hint">Send a dare invitation to an email address. They'll receive the challenge.</p>
          <div class="invite-form">
            <input type="email" [(ngModel)]="inviteEmail" placeholder="warrior@example.com" />
            <button class="btn-dare" (click)="sendInvite()" [disabled]="sendingInvite()">
              <span *ngIf="sendingInvite()" class="spinner-white"></span>
              <span *ngIf="!sendingInvite()">Send Invite</span>
            </button>
          </div>
          <div *ngIf="inviteSuccess()" class="invite-msg success">✓ Invitation sent! Your warrior has been summoned.</div>
          <div *ngIf="inviteError()" class="invite-msg error">{{ inviteError() }}</div>
        </div>

        <!-- Sent invitations -->
        <div class="invites-list" *ngIf="challengeInvitations().length > 0">
          <h3>📨 Sent summons</h3>
          <div *ngFor="let inv of challengeInvitations()" class="sent-invite">
            <span class="sent-email">{{ inv.inviteeEmail }}</span>
            <span class="badge" [ngClass]="{
              'badge-success': inv.status === 'ACCEPTED',
              'badge-warning': inv.status === 'REJECTED',
              'badge-orange': inv.status === 'PENDING'
            }">{{ inv.status }}</span>
          </div>
        </div>
      </div>

    </main>

    <div *ngIf="!challenge() && !loading()" class="empty-state" style="padding:4rem 1rem">
      <div class="empty-icon">❓</div>
      <p>Challenge not found in the arena</p>
      <a routerLink="/dashboard" class="btn-dare-sm">Return to Arena</a>
    </div>
  `,
  styles: [`
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      min-height: 100vh;
      background: radial-gradient(circle at 10% 30%, #121519, #020304);
    }

    .back-link {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-decoration: none;
      display: inline-block;
      margin-bottom: 1rem;
      transition: all 0.2s;
    }
    .back-link:hover { color: var(--blaze-orange); }

    .ch-header { margin-bottom: 2rem; }
    .ch-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    h1 {
      font-size: 2rem;
      background: linear-gradient(135deg, #FFF5E6, #F45B2E);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }
    .ch-concept {
      color: var(--text-dim);
      margin-top: 6px;
      max-width: 500px;
      font-size: 0.95rem;
    }
    .ch-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .ch-dates {
      font-size: 0.85rem;
      color: var(--text-hint);
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .tab {
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      margin-bottom: -1px;
    }
    .tab:hover { color: var(--text); }
    .tab.active {
      color: var(--blaze-orange);
      border-bottom-color: var(--blaze-orange);
    }

    .tab-panel { animation: fadeUp 0.25s ease; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spinner-orange {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(244, 91, 46, 0.2);
      border-top: 3px solid #F45B2E;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Stats */
    .cl-stats {
      background: #171A1F;
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
    }
    .cl-stats {
      display: grid;
      grid-template-columns: repeat(3, auto) 1fr;
      align-items: center;
      gap: 12px 2rem;
    }
    .cl-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .cl-stat-val {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 800;
    }
    .cl-stat-val.orange { color: var(--blaze-orange); }
    .cl-stat-val.warning { color: var(--warning); }
    .cl-stat-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .progress-bar-wrap { grid-column: 1 / -1; margin-top: 8px; }
    .progress-bar { height: 8px; background: #1A1D24; border-radius: 100px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #F45B2E, #FF8C5A); border-radius: 100px; transition: width 0.4s ease; }

    /* Checklist months */
    .cl-month { margin-bottom: 2rem; }
    .month-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .dot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 42px);
      gap: 10px;
    }
    .dot {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      background: #0E0F14;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: var(--text-hint);
      font-weight: 600;
    }
    .dot:hover {
      border-color: var(--blaze-orange);
      background: rgba(244, 91, 46, 0.1);
    }
    .dot.completed {
      background: linear-gradient(135deg, #F45B2E, #D63E0E);
      border-color: var(--blaze-orange);
      color: white;
      animation: checkPop 0.25s ease;
      font-size: 1rem;
    }
    .dot-date { font-size: 0.7rem; font-weight: 500; }

    /* Leaderboard */
    .lb-list { display: flex; flex-direction: column; gap: 12px; }
    .lb-row {
      background: #171A1F;
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 1rem 1.25rem;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s;
    }
    .lb-row.top {
      border-color: var(--blaze-orange);
      background: rgba(244, 91, 46, 0.08);
    }
    .lb-row.mine { border-color: var(--success); }
    .lb-rank {
      font-size: 1.5rem;
      min-width: 50px;
      font-weight: 700;
      color: var(--blaze-orange);
    }
    .lb-user { display: flex; align-items: center; gap: 12px; }
    .lb-avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #F45B2E, #D63E0E);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
    }
    .lb-info { display: flex; flex-direction: column; gap: 2px; }
    .lb-info strong { font-size: 1rem; color: var(--text); }
    .lb-info span { font-size: 0.75rem; color: var(--text-muted); }
    .lb-right { text-align: right; min-width: 100px; }
    .lb-rate {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--blaze-orange);
      margin-bottom: 6px;
    }
    .lb-bar { height: 6px; background: #1A1D24; border-radius: 100px; overflow: hidden; }
    .lb-bar-fill { height: 100%; background: linear-gradient(90deg, #F45B2E, #FF8C5A); border-radius: 100px; transition: width 0.5s ease; }

    /* Invite section */
    .invite-section { margin-bottom: 2rem; }
    .invite-section h3 { margin-bottom: 8px; color: var(--text); }
    .invite-hint { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .invite-form { display: flex; gap: 12px; }
    .invite-form input { flex: 1; }
    .invite-msg {
      margin-top: 12px;
      font-size: 0.875rem;
      padding: 10px 16px;
      border-radius: 16px;
    }
    .invite-msg.success {
      background: rgba(66, 185, 131, 0.15);
      color: var(--success);
      border-left: 3px solid var(--success);
    }
    .invite-msg.error {
      background: rgba(244, 91, 46, 0.15);
      color: var(--blaze-orange);
      border-left: 3px solid var(--blaze-orange);
    }

    .invites-list { margin-top: 2rem; }
    .invites-list h3 { margin-bottom: 1rem; font-size: 1rem; }
    .sent-invite {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .sent-email { font-size: 0.9rem; color: var(--text); }

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
    .btn-dare-sm {
      background: linear-gradient(95deg, #F45B2E, #D63E0E);
      border: none;
      border-radius: 30px;
      padding: 8px 20px;
      font-weight: 700;
      font-size: 0.8rem;
      color: white;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .btn-dare:hover, .btn-dare-sm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(244, 91, 46, 0.4);
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
    @keyframes checkPop {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.3s ease both; }
  `]
})
export class ChallengeDetailComponent implements OnInit {
  challenge = signal<Challenge | null>(null);
  checklist = signal<ChecklistEntry[]>([]);
  leaderboard = signal<LeaderboardResponse | null>(null);
  challengeInvitations = signal<Invitation[]>([]);
  loading = signal(true);
  loadingChecklist = signal(true);
  loadingLeaderboard = signal(false);
  activeTab = signal<'checklist' | 'leaderboard' | 'invite'>('checklist');
  inviteEmail = '';
  sendingInvite = signal(false);
  inviteSuccess = signal(false);
  inviteError = signal('');

  completedCount = computed(() => this.checklist().filter(e => e.completed).length);
  completionRate = computed(() => {
    const t = this.checklist().length;
    return t === 0 ? 0 : (this.completedCount() / t) * 100;
  });

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private invitationService: InvitationService,
    private statsService: StatsService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.challengeService.getChallengeById(id).subscribe({
      next: c => { this.challenge.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.challengeService.getMyChecklist(id).subscribe({
      next: e => { this.checklist.set(e); this.loadingChecklist.set(false); },
      error: () => this.loadingChecklist.set(false)
    });
    if (this.isCreator()) {
      this.invitationService.getChallengeInvitations(id).subscribe(i => this.challengeInvitations.set(i));
    }
  }

  isCreator(): boolean {
    const c = this.challenge();
    return !!c && c.creatorUsername === this.auth.currentUser()?.username;
  }

  isMe(userId: number): boolean {
    return false;
  }

  groupedChecklist() {
    const groups: { month: string; entries: ChecklistEntry[] }[] = [];
    let currentMonth = '';
    for (const entry of this.checklist()) {
      const month = new Date(entry.entryDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (month !== currentMonth) {
        groups.push({ month, entries: [] });
        currentMonth = month;
      }
      groups[groups.length - 1].entries.push(entry);
    }
    return groups;
  }

  getDayNum(dateStr: string): string {
    return String(new Date(dateStr).getDate());
  }

  toggleEntry(entry: ChecklistEntry) {
    const challengeId = this.challenge()!.id;
    this.challengeService.markEntry(challengeId, entry.id, !entry.completed).subscribe(updated => {
      this.checklist.update(list => list.map(e => e.id === entry.id ? updated : e));
    });
  }

  loadLeaderboard() {
    if (this.leaderboard()) return;
    this.loadingLeaderboard.set(true);
    this.statsService.getLeaderboard(this.challenge()!.id).subscribe({
      next: lb => { this.leaderboard.set(lb); this.loadingLeaderboard.set(false); },
      error: () => this.loadingLeaderboard.set(false)
    });
  }

  sendInvite() {
    if (!this.inviteEmail) return;
    this.sendingInvite.set(true);
    this.inviteSuccess.set(false);
    this.inviteError.set('');
    this.invitationService.sendInvitation(this.challenge()!.id, this.inviteEmail).subscribe({
      next: (inv) => {
        this.sendingInvite.set(false);
        this.inviteSuccess.set(true);
        this.inviteEmail = '';
        this.challengeInvitations.update(list => [...list, inv]);
      },
      error: (e) => {
        this.inviteError.set(e.error?.message || 'Failed to send invitation');
        this.sendingInvite.set(false);
      }
    });
  }
}
