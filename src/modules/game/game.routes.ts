import type { FastifyInstance } from "fastify";

export async function gameRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { module: "game", status: "ok" };
  });

  // TODO Phase 1B: Implement game endpoints
  // Specific endpoints depend on game genre (PD-001 — pending owner decision)
}
