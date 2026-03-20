import type { FastifyInstance } from "fastify";
import { AppError } from "../shared/index.js";

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message,
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
