import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardResponse, UserStats } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getLeaderboard(challengeId: number) {
    return this.http.get<LeaderboardResponse>(`${environment.apiUrl}/stats/challenge/${challengeId}/leaderboard`);
  }

  getMyStats(challengeId: number) {
    return this.http.get<UserStats>(`${environment.apiUrl}/stats/challenge/${challengeId}/me`);
  }
}
