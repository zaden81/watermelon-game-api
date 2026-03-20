import type { FastifyInstance } from "fastify";

export async function leaderboardRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { module: "leaderboard", status: "ok" };
  });

  // TODO Phase 1C: Implement leaderboard endpoints
  // GET /leaderboard — Get leaderboard entries
  // Auth rules depend on PD-003 (can guests view?)
}
