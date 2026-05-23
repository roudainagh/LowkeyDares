import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Challenge, ChecklistEntry, CreateChallengeRequest } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  constructor(private http: HttpClient) {}

  createChallenge(req: CreateChallengeRequest) {
    return this.http.post<Challenge>(`${environment.apiUrl}/challenges`, req);
  }

  getMyCreatedChallenges() {
    return this.http.get<Challenge[]>(`${environment.apiUrl}/challenges/mine`);
  }

  getMyJoinedChallenges() {
    return this.http.get<Challenge[]>(`${environment.apiUrl}/challenges/joined`);
  }

  getChallengeById(id: number) {
    return this.http.get<Challenge>(`${environment.apiUrl}/challenges/${id}`);
  }

  getMyChecklist(challengeId: number) {
    return this.http.get<ChecklistEntry[]>(`${environment.apiUrl}/challenges/${challengeId}/checklist`);
  }

  markEntry(challengeId: number, entryId: number, completed: boolean) {
    return this.http.patch<ChecklistEntry>(
      `${environment.apiUrl}/challenges/${challengeId}/checklist/${entryId}?completed=${completed}`, {}
    );
  }
}
