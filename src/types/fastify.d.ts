import type { JwtPayload } from "../modules/auth/auth.types.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}
