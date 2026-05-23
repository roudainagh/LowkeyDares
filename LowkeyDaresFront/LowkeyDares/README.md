# Committed — Challenge Tracker Frontend

Angular 17 frontend for the Challenges Spring Boot backend.

## Setup

```bash
npm install
ng serve
```

App runs at `http://localhost:4200`  
Backend expected at `http://localhost:8080/api`

## Structure

```
src/app/
├── core/
│   ├── guards/         # authGuard
│   ├── interceptors/   # JWT auth interceptor
│   └── services/       # AuthService, ChallengeService, InvitationService, StatsService
├── features/
│   ├── auth/           # Login & Register pages
│   ├── dashboard/      # Main hub
│   └── challenges/     # New challenge form + challenge detail
└── shared/
    ├── components/     # NavbarComponent
    └── models/         # TypeScript interfaces matching backend DTOs
```

## Pages

| Route | Description |
|---|---|
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/dashboard` | Home — your challenges + pending invites |
| `/challenges/new` | Create a challenge |
| `/challenges/:id` | Challenge detail — checklist, leaderboard, invite |

## API Mapping

All API calls use JWT Bearer token stored in localStorage.

| Feature | Endpoint |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Challenges | `GET /api/challenges/mine`, `GET /api/challenges/joined`, `POST /api/challenges` |
| Checklist | `GET /api/challenges/:id/checklist`, `PATCH /api/challenges/:id/checklist/:entryId` |
| Invitations | `POST /api/invitations/challenge/:id/invite`, `GET /api/invitations/pending`, `PATCH /api/invitations/:id/respond` |
| Stats | `GET /api/stats/challenge/:id/leaderboard`, `GET /api/stats/challenge/:id/me` |

## Changing the API URL

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://your-backend:8080/api'
};
```
