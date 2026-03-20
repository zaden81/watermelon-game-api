import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./auth.schemas.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
} from "./auth.service.js";
import { UnauthorizedError } from "../../shared/index.js";

export async function authRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { module: "auth", status: "ok" };
  });

  // POST /auth/register
  app.post(
    "/register",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const body = registerSchema.parse(request.body);
      const user = await createUser(body.email, body.password, body.name);
      const tokens = await generateTokens(user);
      return reply.status(201).send({ user, tokens });
    },
  );

  // POST /auth/login
  app.post(
    "/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);
      const user = await findUserByEmail(body.email);
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }
      const valid = await verifyPassword(body.password, user.password_hash);
      if (!valid) {
        throw new UnauthorizedError("Invalid email or password");
      }
      const { password_hash: _, ...safeUser } = user;
      const tokens = await generateTokens(safeUser);
      return reply.send({ user: safeUser, tokens });
    },
  );

  // POST /auth/logout
  app.post(
    "/logout",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const body = refreshSchema.parse(request.body);
      await revokeRefreshToken(body.refreshToken);
      return reply.send({ message: "Logged out" });
    },
  );

  // POST /auth/refresh
  app.post(
    "/refresh",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const body = refreshSchema.parse(request.body);
      const tokens = await refreshAccessToken(body.refreshToken);
      return reply.send({ tokens });
    },
  );

  // GET /auth/me
  app.get(
    "/me",
    {
      preHandler: [requireAuth],
      config: { rateLimit: { max: 100, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const user = await findUserById(request.user!.sub);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }
      return reply.send({ user });
    },
  );
}
