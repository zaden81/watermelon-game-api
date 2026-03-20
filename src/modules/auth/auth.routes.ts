import type { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { module: "auth", status: "ok" };
  });

  // TODO Phase 1A: Implement auth endpoints
  // POST /auth/google       — Google OAuth redirect
  // GET  /auth/google/callback — Google OAuth callback
  // POST /auth/github       — GitHub OAuth redirect
  // GET  /auth/github/callback — GitHub OAuth callback
  // POST /auth/register     — Email + password registration
  // POST /auth/login        — Email + password login
  // POST /auth/logout       — Logout
  // GET  /auth/me           — Current user info
}
