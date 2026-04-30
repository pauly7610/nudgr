import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generateApiKey } from "../lib/apiKey.js";

const createKeySchema = z.object({
  keyName: z.string().min(1).max(120),
  allowedDomains: z.array(z.string().min(1)).default([]),
  propertyId: z.string().uuid().optional()
});

const updateKeySchema = z.object({
  keyName: z.string().min(1).max(120).optional(),
  allowedDomains: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
  propertyId: z.string().uuid().nullable().optional()
});

const getUserId = (request: { user?: unknown }): string | null => {
  const payload = request.user as { sub?: string } | undefined;
  return payload?.sub ?? null;
};

const asStringArray = (raw: unknown): string[] => {
  return Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === "string")
    : [];
};

const normalizeKeyResponse = <T extends { allowedDomains: unknown }>(key: T): T & { allowedDomains: string[] } => {
  return {
    ...key,
    allowedDomains: asStringArray(key.allowedDomains)
  };
};

export const apiKeyRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api-keys", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        propertyId: true,
        keyName: true,
        keyPrefix: true,
        isActive: true,
        allowedDomains: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            name: true,
            domain: true,
            environment: true
          }
        }
      }
    });

    return reply.send(keys.map(normalizeKeyResponse));
  });

  app.post("/api-keys", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = createKeySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid request", issues: parseResult.error.flatten() });
    }

    const generated = generateApiKey();
    const property = parseResult.data.propertyId
      ? await prisma.analyticsProperty.findFirst({
          where: { id: parseResult.data.propertyId, userId }
        })
      : null;

    if (parseResult.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const created = await prisma.apiKey.create({
      data: {
        userId,
        propertyId: property?.id,
        keyName: parseResult.data.keyName,
        keyHash: generated.hash,
        keyPrefix: generated.keyPrefix,
        allowedDomains: parseResult.data.allowedDomains.length > 0
          ? parseResult.data.allowedDomains
          : property
            ? [property.domain]
            : [],
        isActive: true
      },
      select: {
        id: true,
        propertyId: true,
        keyName: true,
        keyPrefix: true,
        isActive: true,
        allowedDomains: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            name: true,
            domain: true,
            environment: true
          }
        }
      }
    });

    return reply.code(201).send({
      ...normalizeKeyResponse(created),
      apiKey: generated.plain
    });
  });

  app.patch("/api-keys/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const id = z.string().uuid().safeParse((request.params as { id?: string }).id);
    if (!id.success) {
      return reply.code(400).send({ message: "Invalid key id" });
    }

    const parseResult = updateKeySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid request", issues: parseResult.error.flatten() });
    }

    const existing = await prisma.apiKey.findFirst({ where: { id: id.data, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "API key not found" });
    }

    if (parseResult.data.propertyId) {
      const property = await prisma.analyticsProperty.findFirst({
        where: { id: parseResult.data.propertyId, userId }
      });
      if (!property) {
        return reply.code(404).send({ message: "Property not found" });
      }
    }

    const updated = await prisma.apiKey.update({
      where: { id: id.data },
      data: {
        keyName: parseResult.data.keyName,
        allowedDomains: parseResult.data.allowedDomains,
        isActive: parseResult.data.isActive,
        propertyId: parseResult.data.propertyId
      },
      select: {
        id: true,
        propertyId: true,
        keyName: true,
        keyPrefix: true,
        isActive: true,
        allowedDomains: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            name: true,
            domain: true,
            environment: true
          }
        }
      }
    });

    return reply.send(normalizeKeyResponse(updated));
  });

  app.delete("/api-keys/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const id = z.string().uuid().safeParse((request.params as { id?: string }).id);
    if (!id.success) {
      return reply.code(400).send({ message: "Invalid key id" });
    }

    const existing = await prisma.apiKey.findFirst({ where: { id: id.data, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "API key not found" });
    }

    await prisma.apiKey.delete({ where: { id: id.data } });

    return reply.send({ ok: true });
  });
};
