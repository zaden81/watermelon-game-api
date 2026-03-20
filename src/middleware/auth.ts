import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../modules/auth/auth.jwt.js";
import { UnauthorizedError } from "../shared/index.js";

export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = header.slice(7);
  try {
    request.user = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
