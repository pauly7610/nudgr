import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { generateApiKey } from "../lib/apiKey.js";
import { prisma } from "../lib/prisma.js";

const propertyTypeSchema = z.enum(["website", "web_app", "mobile_app", "desktop_app", "backend_service"]);
const environmentSchema = z.enum(["production", "staging", "development"]);

const createPropertySchema = z.object({
  name: z.string().trim().min(1).max(120),
  domain: z.string().trim().min(1).max(255),
  propertyType: propertyTypeSchema.default("website"),
  environment: environmentSchema.default("production")
});

const updatePropertySchema = createPropertySchema.partial();

const createPropertyKeySchema = z.object({
  keyName: z.string().trim().min(1).max(120).optional()
});

const propertyIdSchema = z.object({
  id: z.string().uuid()
});

const getUserId = (request: { user?: unknown }): string | null => {
  const payload = request.user as { sub?: string } | undefined;
  return payload?.sub ?? null;
};

const normalizeDomain = (rawDomain: string): string => {
  const trimmed = rawDomain.trim();

  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname.toLowerCase();
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .trim()
      .toLowerCase();
  }
};

const compactDate = (value: Date | null | undefined): string | null => {
  return value ? value.toISOString() : null;
};

const asStringArray = (raw: unknown): string[] => {
  return Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === "string")
    : [];
};

const latestDate = (dates: Array<Date | null | undefined>): Date | null => {
  const timestamps = dates
    .filter((date): date is Date => Boolean(date))
    .map((date) => date.getTime());

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps));
};

type PropertyRecord = {
  id: string;
  name: string;
  domain: string;
  propertyType: string;
  environment: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  apiKeys: Array<{
    id: string;
    keyName: string;
    keyPrefix: string;
    isActive: boolean;
    allowedDomains: unknown;
    lastUsedAt: Date | null;
    createdAt: Date;
  }>;
  _count: {
    frictionEvents: number;
  };
};

const toPropertyResponse = (property: PropertyRecord) => {
  const lastKeyUse = latestDate(property.apiKeys.map((key) => key.lastUsedAt));
  const lastSeenAt = latestDate([property.lastSeenAt, lastKeyUse]);

  return {
    id: property.id,
    name: property.name,
    domain: property.domain,
    propertyType: property.propertyType,
    environment: property.environment,
    status: lastSeenAt ? "connected" : "awaiting_traffic",
    lastSeenAt: compactDate(lastSeenAt),
    eventCount: property._count.frictionEvents,
    apiKeyCount: property.apiKeys.length,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    apiKeys: property.apiKeys.map((key) => ({
      id: key.id,
      keyName: key.keyName,
      keyPrefix: key.keyPrefix,
      isActive: key.isActive,
      allowedDomains: asStringArray(key.allowedDomains),
      lastUsedAt: compactDate(key.lastUsedAt),
      createdAt: key.createdAt.toISOString()
    }))
  };
};

const selectProperty = {
  id: true,
  name: true,
  domain: true,
  propertyType: true,
  environment: true,
  lastSeenAt: true,
  createdAt: true,
  updatedAt: true,
  apiKeys: {
    orderBy: {
      createdAt: "desc" as const
    },
    select: {
      id: true,
      keyName: true,
      keyPrefix: true,
      isActive: true,
      allowedDomains: true,
      lastUsedAt: true,
      createdAt: true
    }
  },
  _count: {
    select: {
      frictionEvents: true
    }
  }
};

export const propertyRoutes: FastifyPluginAsync = async (app) => {
  app.get("/properties", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const properties = await prisma.analyticsProperty.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: selectProperty
    });

    return reply.send(properties.map(toPropertyResponse));
  });

  app.post("/properties", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = createPropertySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid property", issues: parseResult.error.flatten() });
    }

    const domain = normalizeDomain(parseResult.data.domain);
    const generated = generateApiKey();
    const keyName = `${parseResult.data.name} install key`;

    const result = await prisma.$transaction(async (tx) => {
      const property = await tx.analyticsProperty.create({
        data: {
          userId,
          name: parseResult.data.name,
          domain,
          propertyType: parseResult.data.propertyType,
          environment: parseResult.data.environment
        }
      });

      await tx.apiKey.create({
        data: {
          userId,
          propertyId: property.id,
          keyName,
          keyHash: generated.hash,
          keyPrefix: generated.keyPrefix,
          allowedDomains: [domain],
          isActive: true
        }
      });

      const hydrated = await tx.analyticsProperty.findUniqueOrThrow({
        where: { id: property.id },
        select: selectProperty
      });

      return hydrated;
    });

    return reply.code(201).send({
      property: toPropertyResponse(result),
      apiKey: generated.plain
    });
  });

  app.patch("/properties/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = propertyIdSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid property id" });
    }

    const parseResult = updatePropertySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid property", issues: parseResult.error.flatten() });
    }

    const existing = await prisma.analyticsProperty.findFirst({
      where: { id: params.data.id, userId }
    });
    if (!existing) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const updated = await prisma.analyticsProperty.update({
      where: { id: params.data.id },
      data: {
        name: parseResult.data.name,
        domain: parseResult.data.domain ? normalizeDomain(parseResult.data.domain) : undefined,
        propertyType: parseResult.data.propertyType,
        environment: parseResult.data.environment
      },
      select: selectProperty
    });

    return reply.send(toPropertyResponse(updated));
  });

  app.delete("/properties/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = propertyIdSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid property id" });
    }

    const existing = await prisma.analyticsProperty.findFirst({
      where: { id: params.data.id, userId }
    });
    if (!existing) {
      return reply.code(404).send({ message: "Property not found" });
    }

    await prisma.analyticsProperty.delete({ where: { id: params.data.id } });
    return reply.send({ ok: true });
  });

  app.post("/properties/:id/api-keys", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = propertyIdSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid property id" });
    }

    const parseResult = createPropertyKeySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid key request", issues: parseResult.error.flatten() });
    }

    const property = await prisma.analyticsProperty.findFirst({
      where: { id: params.data.id, userId }
    });
    if (!property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const generated = generateApiKey();
    const created = await prisma.apiKey.create({
      data: {
        userId,
        propertyId: property.id,
        keyName: parseResult.data.keyName ?? `${property.name} install key`,
        keyHash: generated.hash,
        keyPrefix: generated.keyPrefix,
        allowedDomains: [property.domain],
        isActive: true
      },
      select: {
        id: true,
        keyName: true,
        keyPrefix: true,
        isActive: true,
        allowedDomains: true,
        lastUsedAt: true,
        createdAt: true
      }
    });

    return reply.code(201).send({
      ...created,
      lastUsedAt: compactDate(created.lastUsedAt),
      createdAt: created.createdAt.toISOString(),
      apiKey: generated.plain
    });
  });

  app.post("/properties/:id/verify", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = propertyIdSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid property id" });
    }

    const property = await prisma.analyticsProperty.findFirst({
      where: { id: params.data.id, userId },
      select: selectProperty
    });
    if (!property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const [latestEvent, latestPerformanceMetric, latestError] = await Promise.all([
      prisma.frictionEvent.findFirst({
        where: { propertyId: property.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      }),
      prisma.performanceMetric.findFirst({
        where: { propertyId: property.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      }),
      prisma.errorLog.findFirst({
        where: { propertyId: property.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      })
    ]);

    const lastSignalAt = latestDate([
      property.lastSeenAt,
      ...property.apiKeys.map((key) => key.lastUsedAt),
      latestEvent?.createdAt,
      latestPerformanceMetric?.createdAt,
      latestError?.createdAt
    ]);

    return reply.send({
      connected: Boolean(lastSignalAt),
      status: lastSignalAt ? "connected" : "awaiting_traffic",
      lastSeenAt: compactDate(lastSignalAt),
      eventCount: property._count.frictionEvents,
      apiKeyCount: property.apiKeys.length
    });
  });
};
