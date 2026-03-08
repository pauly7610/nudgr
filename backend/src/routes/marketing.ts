import type { FastifyPluginAsync } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const marketingProviderSchema = z.enum(["ga4", "google_ads", "meta_ads"]);

const marketingEventSchema = z.object({
  externalEventId: z.string().min(1).optional(),
  campaignId: z.string().min(1).optional(),
  campaignName: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  medium: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
  pageUrl: z.string().min(1).optional(),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  costMicros: z.number().int().min(0).optional(),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const importPayloadSchema = z.object({
  provider: marketingProviderSchema,
  events: z.array(marketingEventSchema).min(1).max(500)
});

const toRecord = (
  userId: string,
  provider: z.infer<typeof marketingProviderSchema>,
  event: z.infer<typeof marketingEventSchema>
): Prisma.AnalyticsEventCreateManyInput => {
  return {
    userId,
    eventName: `marketing_${provider}`,
    pageUrl: event.pageUrl,
    sessionId: event.sessionId,
    eventProperties: {
      provider,
      externalEventId: event.externalEventId,
      campaignId: event.campaignId,
      campaignName: event.campaignName,
      source: event.source,
      medium: event.medium,
      impressions: event.impressions ?? 0,
      clicks: event.clicks ?? 0,
      conversions: event.conversions ?? 0,
      costMicros: event.costMicros ?? 0,
      importedAt: new Date().toISOString(),
      originalTimestamp: event.timestamp,
      metadata: event.metadata ?? {}
    } as Prisma.InputJsonValue
  };
};

const asObject = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as Record<string, unknown>;
};

const asNumber = (raw: unknown): number => {
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
};

export const marketingRoutes: FastifyPluginAsync = async (app) => {
  app.post("/marketing/import-events", { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.user as { sub?: string };
    const userId = payload?.sub;
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = importPayloadSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid marketing import payload",
        issues: parseResult.error.flatten()
      });
    }

    await prisma.analyticsEvent.createMany({
      data: parseResult.data.events.map((event) => toRecord(userId, parseResult.data.provider, event))
    });

    return reply.code(202).send({
      ok: true,
      provider: parseResult.data.provider,
      accepted: parseResult.data.events.length
    });
  });

  app.get("/marketing/import-summary", { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.user as { sub?: string };
    const userId = payload?.sub;
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const imported = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        eventName: {
          in: ["marketing_ga4", "marketing_google_ads", "marketing_meta_ads"]
        },
        createdAt: {
          gte: since
        }
      },
      select: {
        eventName: true,
        eventProperties: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5000
    });

    const aggregates = {
      ga4: { importedEvents: 0, impressions: 0, clicks: 0, conversions: 0, costMicros: 0 },
      google_ads: { importedEvents: 0, impressions: 0, clicks: 0, conversions: 0, costMicros: 0 },
      meta_ads: { importedEvents: 0, impressions: 0, clicks: 0, conversions: 0, costMicros: 0 }
    };

    for (const row of imported) {
      const provider = row.eventName.replace("marketing_", "") as keyof typeof aggregates;
      const bucket = aggregates[provider];
      if (!bucket) {
        continue;
      }

      const props = asObject(row.eventProperties);
      bucket.importedEvents += 1;
      bucket.impressions += asNumber(props.impressions);
      bucket.clicks += asNumber(props.clicks);
      bucket.conversions += asNumber(props.conversions);
      bucket.costMicros += asNumber(props.costMicros);
    }

    return reply.send({
      windowDays: 30,
      since: since.toISOString(),
      summary: aggregates
    });
  });
};
