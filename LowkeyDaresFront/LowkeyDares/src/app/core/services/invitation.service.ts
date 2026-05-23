import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invitation } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  constructor(private http: HttpClient) {}

  sendInvitation(challengeId: number, email: string) {
    return this.http.post<Invitation>(
      `${environment.apiUrl}/invitations/challenge/${challengeId}/invite?email=${encodeURIComponent(email)}`, {}
    );
  }

  getMyPendingInvitations() {
    return this.http.get<Invitation[]>(`${environment.apiUrl}/invitations/pending`);
  }

  getChallengeInvitations(challengeId: number) {
    return this.http.get<Invitation[]>(`${environment.apiUrl}/invitations/challenge/${challengeId}`);
  }

  respondToInvitation(invitationId: number, accept: boolean) {
    return this.http.patch<Invitation>(
      `${environment.apiUrl}/invitations/${invitationId}/respond?accept=${accept}`, {}
    );
  }
}
