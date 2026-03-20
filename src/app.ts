import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { getEnv } from "./config/index.js";
import { errorHandler } from "./middleware/index.js";
import { authRoutes } from "./modules/auth/index.js";
import { gameRoutes } from "./modules/game/index.js";
import { leaderboardRoutes } from "./modules/leaderboard/index.js";

export async function buildApp() {
  const env = getEnv();

  const app = Fastify({
    logger: true,
  });

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Error handler
  await errorHandler(app);

  // Health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register module routes
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(gameRoutes, { prefix: "/game" });
  await app.register(leaderboardRoutes, { prefix: "/leaderboard" });

  return app;
}
