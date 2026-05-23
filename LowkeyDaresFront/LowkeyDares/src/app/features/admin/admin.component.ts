import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AdminService } from '../../core/services/admin.service';
import { AdminStats, UserProfile, TopChallenge } from '../../shared/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, NavbarComponent],
  template: `
    <app-navbar />

    <main class="page">
      <div class="page-header fade-up">
        <h1>👑 Overseer's throne</h1>
        <p class="page-sub">Command the arena. Shape the legends.</p>
      </div>

      <!-- Stats Grid -->
      <section class="stats-grid fade-up" *ngIf="stats()">
        <div class="stat-card">
          <span class="stat-label">⚔️ Warriors</span>
          <span class="stat-value orange">{{ stats()!.totalUsers }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">🔥 Dares</span>
          <span class="stat-value success">{{ stats()!.totalChallenges }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">📨 Summons</span>
          <span class="stat-value warning">{{ stats()!.totalInvitations }}</span>
          <span class="stat-sub">{{ stats()!.acceptedInvitations }} answered</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">💪 Victory rate</span>
          <span class="stat-value orange">{{ stats()!.completionRate | number:'1.1-1' }}%</span>
          <span class="stat-sub">of all dares completed</span>
        </div>
      </section>

      <!-- Two column layout -->
      <section class="two-col fade-up" *ngIf="stats()">

        <!-- Warriors list -->
        <div class="card">
          <div class="card-header">
            <h2>⚔️ Recent warriors</h2>
            <button class="btn-ghost-sm" (click)="loadAllUsers()">View all</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Warrior</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of displayedUsers()">
                  <td>
                    <div class="user-cell">
                      <span class="avatar">{{ initials(u.username) }}</span>
                      <div>
                        <div class="user-name">{{ u.username }}</div>
                        <div class="user-email">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align:right">
                    <div class="actions">
                      <button class="btn-icon promote" title="Anoint as Overseer"
                              (click)="promote(u.id)" [disabled]="actionId() === u.id">
                        👑
                      </button>
                      <button class="btn-icon danger" title="Banish warrior"
                              (click)="deleteUser(u.id)" [disabled]="actionId() === u.id">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top dares -->
        <div class="card">
          <div class="card-header">
            <h2>🏆 Legendary dares</h2>
          </div>
          <div class="completion-big">
            <span class="num">{{ stats()!.completionRate | number:'1.1-1' }}%</span>
            <span class="comp-label">arena completion rate</span>
          </div>
          <div *ngFor="let c of stats()!.topChallenges" class="progress-row">
            <span class="progress-label" [title]="c.name">{{ c.name }}</span>
            <div class="progress-bg">
              <div class="progress-fill" [style.width.%]="progressPct(c.participantCount)">
              </div>
            </div>
            <span class="progress-count">{{ c.participantCount }} warriors</span>
          </div>
        </div>
      </section>

      <!-- All dares table -->
      <section class="card fade-up" *ngIf="stats()">
        <div class="card-header">
          <h2>📜 All active dares</h2>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Dare name</th>
                <th>Dare master</th>
                <th>Warriors</th>
                <th style="text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of stats()!.topChallenges">
                <td class="fw-500">{{ c.name }}</td>
                <td>{{ c.creatorUsername }}</td>
                <td>{{ c.participantCount }}</td>
                <td style="text-align:right">
                  <button class="btn-icon danger" (click)="deleteChallenge(c.id)"
                          [disabled]="actionId() === c.id">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div *ngIf="loading()" class="loading-row">
        <div class="spinner-orange"></div>
      </div>
    </main>
  `,
  styles: [`
    .page {
      max-width: 1100px;
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

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #171A1F;
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.2s;
    }

    .stat-card:hover {
      border-color: rgba(244, 91, 46, 0.3);
      transform: translateY(-2px);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
    }

    .stat-value.orange { color: var(--blaze-orange); }
    .stat-value.success { color: var(--success); }
    .stat-value.warning { color: var(--warning); }

    .stat-sub {
      font-size: 0.7rem;
      color: var(--text-hint);
      margin-top: 4px;
    }

    /* Two column layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 2rem;
    }

    /* Cards */
    .card {
      background: #171A1F;
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 1.5rem;
      transition: all 0.2s;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .card-header h2 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.2px;
    }

    .btn-ghost-sm {
      font-size: 0.75rem;
      color: var(--blaze-orange);
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      transition: all 0.2s;
    }

    .btn-ghost-sm:hover {
      background: rgba(244, 91, 46, 0.1);
    }

    /* Tables */
    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    th {
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      padding: 0 8px 12px;
      border-bottom: 1px solid var(--border);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 12px 8px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }
    .fw-500 { font-weight: 600; color: var(--text); }

    /* User cell */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #F45B2E, #D63E0E);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
    }

    .user-email {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Action buttons */
    .actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .btn-icon {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #0E0F14;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .btn-icon:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .btn-icon.danger {
      color: #F45B2E;
      border-color: rgba(244, 91, 46, 0.3);
    }

    .btn-icon.danger:hover:not(:disabled) {
      background: rgba(244, 91, 46, 0.15);
      border-color: var(--blaze-orange);
    }

    .btn-icon.promote {
      color: var(--warning);
      border-color: rgba(232, 140, 16, 0.3);
    }

    .btn-icon.promote:hover:not(:disabled) {
      background: rgba(232, 140, 16, 0.15);
      border-color: var(--warning);
    }

    /* Completion section */
    .completion-big {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }

    .num {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--blaze-orange);
    }

    .comp-label {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Progress rows */
    .progress-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .progress-label {
      font-size: 0.8rem;
      color: var(--text-dim);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .progress-bg {
      flex: 2;
      height: 6px;
      background: #1A1D24;
      border-radius: 100px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 100px;
      background: linear-gradient(90deg, #F45B2E, #FF8C5A);
      transition: width 0.4s ease;
    }

    .progress-count {
      font-size: 0.75rem;
      color: var(--text-muted);
      min-width: 70px;
      text-align: right;
      font-weight: 500;
    }

    /* Loading */
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-up { animation: fadeUp 0.3s ease both; }

    /* Responsive */
    @media (max-width: 800px) {
      .two-col { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class AdminComponent implements OnInit {
  stats = signal<AdminStats | null>(null);
  allUsers = signal<UserProfile[]>([]);
  displayedUsers = signal<UserProfile[]>([]);
  loading = signal(true);
  actionId = signal<number | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboard().subscribe(data => {
      this.stats.set(data);
      this.displayedUsers.set(data.recentUsers as unknown as UserProfile[]);
      this.loading.set(false);
    });
  }

  loadAllUsers() {
    this.adminService.getUsers().subscribe(users => {
      this.allUsers.set(users);
      this.displayedUsers.set(users);
    });
  }

  deleteUser(id: number) {
    if (!confirm('⚠️ Banish this warrior from the arena? All their records will be lost.')) return;
    this.actionId.set(id);
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.displayedUsers.update(list => list.filter(u => u.id !== id));
        this.actionId.set(null);
      },
      error: () => this.actionId.set(null)
    });
  }

  promote(id: number) {
    if (!confirm('👑 Anoint this warrior as an Overseer? They will gain admin powers.')) return;
    this.actionId.set(id);
    this.adminService.promoteUser(id).subscribe({
      next: () => this.actionId.set(null),
      error: () => this.actionId.set(null)
    });
  }

  deleteChallenge(id: number) {
    if (!confirm('⚠️ Delete this dare from existence? This cannot be undone.')) return;
    this.actionId.set(id);
    this.adminService.deleteChallenge(id).subscribe({
      next: () => {
        this.stats.update(s => s ? {
          ...s,
          topChallenges: s.topChallenges.filter(c => c.id !== id)
        } : s);
        this.actionId.set(null);
      },
      error: () => this.actionId.set(null)
    });
  }

  progressPct(count: number): number {
    const max = this.stats()?.topChallenges[0]?.participantCount ?? 1;
    return Math.round((count / max) * 100);
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
