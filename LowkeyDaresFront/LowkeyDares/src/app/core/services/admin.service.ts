// admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats, UserProfile } from '../../shared/models';
import { environment } from '../../../environments/environment';  // ← add this

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;  // ← use environment.apiUrl

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/dashboard`);
  }

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.base}/users`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  promoteUser(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/users/${id}/promote`, {});
  }

  deleteChallenge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/challenges/${id}`);
  }
}
