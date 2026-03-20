# Watermelon Game API

Backend API for the Watermelon Game — a featured project in [Thuong's Portfolio](https://github.com/zaden81/portfolio_nextjs).

Built with Fastify, TypeScript, and Neon Serverless Postgres.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify 5
- **Database**: Neon Serverless Postgres
- **Validation**: Zod
- **Auth**: JWT (jsonwebtoken) + bcryptjs

## Project Structure

```
src/
├── app.ts                  → Fastify app setup, plugins, route registration
├── server.ts               → Entry point
├── config/
│   └── env.ts              → Environment variable validation (Zod)
├── modules/
│   ├── auth/
│   │   ├── auth.types.ts   → User, JwtPayload, TokenPair types
│   │   ├── auth.schemas.ts → Zod validation schemas
│   │   ├── auth.jwt.ts     → JWT sign/verify helpers
│   │   ├── auth.service.ts → User CRUD, token generation, password hashing
│   │   ├── auth.routes.ts  → Auth endpoints (register, login, logout, refresh, me)
│   │   └── index.ts        → Barrel export
│   ├── game/               → Game logic and score submission (Phase 1B)
│   └── leaderboard/        → Leaderboard queries (Phase 1C)
├── middleware/
│   ├── auth.ts             → requireAuth JWT verification middleware
│   ├── error-handler.ts    → Global error handler (AppError, ZodError, FastifyError)
│   └── index.ts            → Barrel export
├── shared/
│   ├── db.ts               → Neon database client
│   └── errors.ts           → Custom error classes (AppError, NotFoundError, etc.)
└── types/
    └── fastify.d.ts        → Fastify request type augmentation (request.user)
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database
- Database migrations applied (see [platform-infra](https://github.com/zaden81/platform-infra))

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — Random secret for signing JWT tokens
- `JWT_EXPIRES_IN` — Access token expiry (default: `15m`)
- `REFRESH_TOKEN_EXPIRES_IN` — Refresh token expiry (default: `7d`)
- `PORT` — Server port (default: `3001`)
- `HOST` — Server host (default: `0.0.0.0`)
- `CORS_ORIGIN` — Allowed CORS origin (default: `http://localhost:3000`)

### Development

```bash
npm run dev
```

Server starts on `http://localhost:3001`. The `.env` file is loaded automatically via `--env-file`.

### Build

```bash
npm run build
npm start
```

## API Routes

### Health Check

- `GET /health` — Server health check
- `GET /auth/health` — Auth module health check

### Auth (Phase 1A — Implemented)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create new user (email, password, name) |
| `POST` | `/auth/login` | No | Login with email + password |
| `POST` | `/auth/logout` | No | Revoke refresh token |
| `POST` | `/auth/refresh` | No | Rotate refresh token, get new token pair |
| `GET` | `/auth/me` | Bearer | Get current user info |

**Token strategy**: JWT access token (15m) + rotating refresh token (7d).

**Rate limiting**:
- Register/Login: 10 requests/minute
- Refresh/Logout: 30 requests/minute
- Me: 100 requests/minute

### Auth — OAuth (Phase 1A — TODO)

- `POST /auth/google` — Google OAuth (requires Google Cloud Console setup)
- `POST /auth/github` — GitHub OAuth (requires GitHub OAuth app setup)

### Game (Phase 1B — TODO)

- Endpoints depend on game genre (pending owner decision PD-001)

### Leaderboard (Phase 1C — TODO)

- `GET /leaderboard` — Get leaderboard entries

## Related Repos

- [portfolio_nextjs](https://github.com/zaden81/portfolio_nextjs) — Main portfolio website + game frontend
- [platform-infra](https://github.com/zaden81/platform-infra) — Database migrations and infra config
