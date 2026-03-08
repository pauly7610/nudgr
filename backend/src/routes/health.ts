import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

const startedAt = Date.now();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return {
      ok: true,
      service: "nudgr-backend",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000)
    };
  });

  app.get("/health/deps", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        ok: true,
        service: "nudgr-backend",
        timestamp: new Date().toISOString(),
        checks: {
          database: "up"
        },
        version: process.env.npm_package_version ?? "unknown"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      return reply.code(503).send({
        ok: false,
        service: "nudgr-backend",
        timestamp: new Date().toISOString(),
        checks: {
          database: "down"
        },
        error: message
      });
    }
  });
};
