import type { FastifyInstance, FastifyError } from "fastify";
import { z } from "zod";
import { AppError } from "../shared/index.js";

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler<FastifyError>((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message,
      });
    }

    // Zod validation errors
    if (error instanceof z.ZodError) {
      const message = error.issues.map((i) => i.message).join(", ");
      return reply.status(400).send({
        error: message,
      });
    }

    // Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: error.message,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
    });
  });
}
