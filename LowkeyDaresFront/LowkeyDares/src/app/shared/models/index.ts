export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  username: string;
  role: string;
}

export interface Challenge {
  id: number;
  name: string;
  concept: string;
  startDate: string;
  endDate: string;
  activeDays: string[];
  daysPerWeek: number;
  creatorUsername: string;
}

export interface CreateChallengeRequest {
  name: string;
  concept: string;
  startDate: string;
  endDate: string;
  activeDays: string[];
}

export interface ChecklistEntry {
  id: number;
  entryDate: string;
  completed: boolean;
}

export interface Invitation {
  id: number;
  challengeId: number;
  challengeName: string;
  inviterUsername: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  sentAt: string;
}

export interface UserStats {
  userId: number;
  username: string;
  completedDays: number;
  totalDays: number;
  completionRate: number;
  rank: string;
}

export interface LeaderboardResponse {
  challengeId: number;
  challengeName: string;
  leaderboard: UserStats[];
}




export interface AdminStats {
  totalUsers: number;
  totalChallenges: number;
  totalInvitations: number;
  acceptedInvitations: number;
  pendingInvitations: number;
  checklistEntries: number;
  completedEntries: number;
  completionRate: number;
  recentUsers: RecentUser[];
  topChallenges: TopChallenge[];
}

export interface RecentUser {
  id: number;
  username: string;
  email: string;
}

export interface TopChallenge {
  id: number;
  name: string;
  creatorUsername: string;
  participantCount: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}
