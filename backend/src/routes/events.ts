import type { FastifyPluginAsync } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const eventSchema = z.object({
  eventType: z.string().min(1),
  pageUrl: z.string().min(1),
  sessionId: z.string().min(1),
  severityScore: z.number().int().min(0).max(10).default(0),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const performanceSchema = z.object({
  metricName: z.string().min(1),
  metricValue: z.number(),
  pageUrl: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const errorSchema = z.object({
  errorType: z.string().min(1),
  errorMessage: z.string().min(1),
  errorStack: z.string().optional(),
  componentName: z.string().optional(),
  pageUrl: z.string().optional(),
  userAgent: z.string().optional(),
  severity: z.string().default("medium"),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const resolveUserIdFromAuthHeader = async (
  app: {
    jwt: {
      verify: <T>(token: string) => Promise<T>;
    };
  },
  authHeader: string | undefined
): Promise<string | null> => {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const payload = await app.jwt.verify<{ sub?: string }>(token);
    return payload.sub ?? null;
  } catch {
    return null;
  }
};

export const eventRoutes: FastifyPluginAsync = async (app) => {
  app.post("/events", async (request, reply) => {
    const parseResult = eventSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid event payload", issues: parseResult.error.flatten() });
    }

    const userId = await resolveUserIdFromAuthHeader(app, request.headers.authorization);

    const created = await prisma.frictionEvent.create({
      data: {
        userId,
        eventType: parseResult.data.eventType,
        pageUrl: parseResult.data.pageUrl,
        sessionId: parseResult.data.sessionId,
        severityScore: parseResult.data.severityScore,
        metadata: parseResult.data.metadata as Prisma.InputJsonValue | undefined
      }
    });

    return reply.code(201).send({ id: created.id, createdAt: created.createdAt });
  });

  app.post("/performance-metrics", async (request, reply) => {
    const parseResult = performanceSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid performance metric payload",
        issues: parseResult.error.flatten()
      });
    }

    const userId = await resolveUserIdFromAuthHeader(app, request.headers.authorization);

    const created = await prisma.performanceMetric.create({
      data: {
        userId,
        metricName: parseResult.data.metricName,
        metricValue: parseResult.data.metricValue,
        pageUrl: parseResult.data.pageUrl,
        userAgent: parseResult.data.userAgent,
        metadata: parseResult.data.metadata as Prisma.InputJsonValue | undefined
      }
    });

    return reply.code(201).send({ id: created.id, createdAt: created.createdAt });
  });

  app.post("/error-logs", async (request, reply) => {
    const parseResult = errorSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid error payload",
        issues: parseResult.error.flatten()
      });
    }

    const userId = await resolveUserIdFromAuthHeader(app, request.headers.authorization);

    const created = await prisma.errorLog.create({
      data: {
        userId,
        errorType: parseResult.data.errorType,
        errorMessage: parseResult.data.errorMessage,
        errorStack: parseResult.data.errorStack,
        componentName: parseResult.data.componentName,
        pageUrl: parseResult.data.pageUrl,
        userAgent: parseResult.data.userAgent,
        severity: parseResult.data.severity,
        metadata: parseResult.data.metadata as Prisma.InputJsonValue | undefined
      }
    });

    return reply.code(201).send({ id: created.id, createdAt: created.createdAt });
  });

  app.get("/metrics/recent", { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.user as { sub?: string };
    const userId = payload?.sub;

    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const [events, performance, errors] = await Promise.all([
      prisma.frictionEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 25 }),
      prisma.performanceMetric.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 25 }),
      prisma.errorLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 25 })
    ]);

    return reply.send({ events, performance, errors });
  });
};
