# Watermelon Game API

Backend API for the Watermelon Game — a featured project in [Thuong's Portfolio](https://github.com/zaden81/portfolio_nextjs).

Built with Fastify, TypeScript, and Neon Serverless Postgres.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify 5
- **Database**: Neon Serverless Postgres
- **Validation**: Zod

## Project Structure

```
src/
├── app.ts                  → Fastify app setup, plugins, route registration
├── server.ts               → Entry point
├── config/
│   └── env.ts              → Environment variable validation (Zod)
├── modules/
│   ├── auth/               → Authentication (Google, GitHub, email/password)
│   ├── game/               → Game logic and score submission
│   └── leaderboard/        → Leaderboard queries
├── middleware/
│   └── error-handler.ts    → Global error handler
└── shared/
    ├── db.ts               → Neon database client
    └── errors.ts           → Custom error classes
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

Server starts on `http://localhost:3001`.

### Build

```bash
npm run build
npm start
```

## API Routes

### Health Check

- `GET /health` — Server health check

### Auth (Phase 1A — TODO)

- `POST /auth/google` — Google OAuth
- `POST /auth/github` — GitHub OAuth
- `POST /auth/register` — Email + password registration
- `POST /auth/login` — Email + password login
- `POST /auth/logout` — Logout
- `GET /auth/me` — Current user info

### Game (Phase 1B — TODO)

- Endpoints depend on game genre (pending owner decision)

### Leaderboard (Phase 1C — TODO)

- `GET /leaderboard` — Get leaderboard entries

## Related Repos

- [portfolio_nextjs](https://github.com/zaden81/portfolio_nextjs) — Main portfolio website + game frontend
- [platform-infra](https://github.com/zaden81/platform-infra) — Database migrations and infra config
