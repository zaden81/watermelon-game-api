import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/auth.js";
import { updateScoreSchema } from "./game.schemas.js";
import {
  createSession,
  updateScore,
  completeSession,
  getUserSessions,
} from "./game.service.js";

const LEVELS = [
  {
    id: 1,
    name: "Simple Tower",
    projectileCount: 3,
    blocks: [
      { x: 550, y: 380, width: 40, height: 40 },
      { x: 550, y: 340, width: 40, height: 40 },
      { x: 550, y: 300, width: 40, height: 40 },
    ],
  },
  {
    id: 2,
    name: "Double Stack",
    projectileCount: 3,
    blocks: [
      { x: 500, y: 380, width: 40, height: 40 },
      { x: 500, y: 340, width: 40, height: 40 },
      { x: 560, y: 380, width: 40, height: 40 },
      { x: 560, y: 340, width: 40, height: 40 },
      { x: 530, y: 300, width: 40, height: 40 },
    ],
  },
  {
    id: 3,
    name: "Pyramid",
    projectileCount: 4,
    blocks: [
      { x: 480, y: 380, width: 40, height: 40 },
      { x: 520, y: 380, width: 40, height: 40 },
      { x: 560, y: 380, width: 40, height: 40 },
      { x: 600, y: 380, width: 40, height: 40 },
      { x: 500, y: 340, width: 40, height: 40 },
      { x: 540, y: 340, width: 40, height: 40 },
      { x: 580, y: 340, width: 40, height: 40 },
      { x: 540, y: 300, width: 40, height: 40 },
    ],
  },
];

export async function gameRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { module: "game", status: "ok" };
  });

  // POST /game/sessions
  app.post(
    "/sessions",
    {
      preHandler: [requireAuth],
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const session = await createSession(request.user!.sub);
      return reply.status(201).send({ session });
    },
  );

  // PATCH /game/sessions/:id/score
  app.patch(
    "/sessions/:id/score",
    {
      preHandler: [requireAuth],
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateScoreSchema.parse(request.body);
      const session = await updateScore(
        id,
        request.user!.sub,
        body.score,
        body.levelsCompleted,
      );
      return reply.send({ session });
    },
  );

  // POST /game/sessions/:id/complete
  app.post(
    "/sessions/:id/complete",
    {
      preHandler: [requireAuth],
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const session = await completeSession(id, request.user!.sub);
      return reply.send({ session });
    },
  );

  // GET /game/sessions/me
  app.get(
    "/sessions/me",
    {
      preHandler: [requireAuth],
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const sessions = await getUserSessions(request.user!.sub);
      return reply.send({ sessions });
    },
  );

  // GET /game/levels
  app.get(
    "/levels",
    { config: { rateLimit: { max: 100, timeWindow: "1 minute" } } },
    async (_request, reply) => {
      return reply.send({ levels: LEVELS });
    },
  );
}
