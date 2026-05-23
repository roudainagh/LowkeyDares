// auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

interface StoredUser {
  email: string;
  username: string;
  role: string;          // ← added
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'challenges_token';
  private readonly USER_KEY  = 'challenges_user';

  isLoggedIn  = signal(this.hasToken());
  currentUser = signal<StoredUser | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, username, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const user: StoredUser = { email: res.email, username: res.username, role: res.role }; // ← role stored
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): StoredUser | null {
    const s = localStorage.getItem(this.USER_KEY);
    return s ? (JSON.parse(s) as StoredUser) : null;
  }
}
