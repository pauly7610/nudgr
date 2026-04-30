import type { FastifyPluginAsync } from "fastify";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generateApiKey } from "../lib/apiKey.js";
import { uploadObject } from "../lib/storage.js";

const DEFAULT_SENSITIVE_SELECTORS = ["[data-nudgr-redact]", "[data-private]", "[data-sensitive]"];

const propertyScopedQuerySchema = z.object({
  propertyId: z.string().uuid().optional()
});

const daysQuerySchema = propertyScopedQuerySchema.extend({
  days: z.coerce.number().int().min(1).max(180).default(30)
});

const observabilityQuerySchema = propertyScopedQuerySchema.extend({
  hours: z.coerce.number().int().min(1).max(168).default(24)
});

const privacySettingUpdateSchema = z.object({
  propertyId: z.string().uuid().nullable().optional(),
  retentionDays: z.number().int().min(7).max(1095).optional(),
  autoCleanup: z.boolean().optional(),
  archiveBeforeDelete: z.boolean().optional(),
  redactText: z.boolean().optional(),
  respectDoNotTrack: z.boolean().optional(),
  requireConsent: z.boolean().optional(),
  captureQueryString: z.boolean().optional(),
  captureUrlHash: z.boolean().optional(),
  allowScreenshots: z.boolean().optional(),
  recordingSampleRate: z.number().min(0).max(1).optional(),
  domainAllowlist: z.array(z.string().min(1).max(255)).optional(),
  sensitiveSelectors: z.array(z.string().min(1).max(255)).optional()
});

const eventDefinitionSchema = z.object({
  propertyId: z.string().uuid().nullable().optional(),
  eventName: z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9_.:-]+$/),
  displayName: z.string().trim().max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().min(1).max(80).default("custom"),
  status: z.enum(["active", "draft", "deprecated"]).default("active"),
  owner: z.string().trim().max(120).optional(),
  requiredProperties: z.array(z.string().trim().min(1).max(120)).default([]),
  optionalProperties: z.array(z.string().trim().min(1).max(120)).default([]),
  conversionEvent: z.boolean().default(false),
  piiRisk: z.enum(["low", "medium", "high"]).default("low")
});

const eventDefinitionUpdateSchema = eventDefinitionSchema.partial().omit({ eventName: true });

const exportDestinationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  destinationType: z.enum(["webhook", "s3", "warehouse", "email"]),
  cadence: z.enum(["manual", "daily", "weekly", "monthly"]).default("manual"),
  config: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true)
});

const exportDestinationUpdateSchema = exportDestinationSchema.partial();

const exportCsvSchema = z.object({
  exportType: z.enum(["events", "errors", "performance", "taxonomy"]).default("events"),
  propertyId: z.string().uuid().optional(),
  days: z.number().int().min(1).max(180).default(30)
});

const idParamSchema = z.object({
  id: z.string().uuid()
});

const getUserId = (request: { user?: unknown }): string | null => {
  const payload = request.user as { sub?: string } | undefined;
  return payload?.sub ?? null;
};

const nowIso = (): string => new Date().toISOString();

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const compactDate = (value: Date | null | undefined): string | null => value ? value.toISOString() : null;

const asArray = (raw: unknown): string[] => Array.isArray(raw)
  ? raw.filter((value): value is string => typeof value === "string")
  : [];

const asObject = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as Record<string, unknown>;
};

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const rowsToCsv = (rows: Array<Record<string, unknown>>): string => {
  if (rows.length === 0) {
    return "empty\n";
  }

  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
};

const getWindowStart = (days: number): Date => {
  const now = new Date();
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

const getHourWindowStart = (hours: number): Date => {
  const now = new Date();
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
};

const assertPropertyAccess = async (userId: string, propertyId?: string | null) => {
  if (!propertyId) {
    return null;
  }

  const property = await prisma.analyticsProperty.findFirst({
    where: { id: propertyId, userId },
    select: { id: true, name: true, domain: true, environment: true, lastSeenAt: true }
  });

  return property;
};

const logAudit = async (params: {
  userId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        metadata: params.metadata as InputJsonValue | undefined
      }
    });
  } catch {
    // Audit logging must not block product flows.
  }
};

const defaultPrivacySettings = (params: {
  userId: string;
  propertyId?: string | null;
  domainAllowlist?: string[];
}) => ({
  userId: params.userId,
  propertyId: params.propertyId ?? null,
  retentionDays: 90,
  autoCleanup: true,
  archiveBeforeDelete: false,
  redactText: true,
  respectDoNotTrack: true,
  requireConsent: false,
  captureQueryString: false,
  captureUrlHash: false,
  allowScreenshots: false,
  recordingSampleRate: 0.1,
  domainAllowlist: params.domainAllowlist ?? [],
  sensitiveSelectors: DEFAULT_SENSITIVE_SELECTORS
});

const normalizePrivacySetting = (setting: {
  id: string;
  propertyId: string | null;
  retentionDays: number;
  autoCleanup: boolean;
  archiveBeforeDelete: boolean;
  redactText: boolean;
  respectDoNotTrack: boolean;
  requireConsent: boolean;
  captureQueryString: boolean;
  captureUrlHash: boolean;
  allowScreenshots: boolean;
  recordingSampleRate: number;
  domainAllowlist: unknown;
  sensitiveSelectors: unknown;
  updatedAt: Date;
}) => ({
  ...setting,
  domainAllowlist: asArray(setting.domainAllowlist),
  sensitiveSelectors: asArray(setting.sensitiveSelectors),
  updatedAt: setting.updatedAt.toISOString()
});

const riskTone = (score: number): "low" | "medium" | "high" => {
  if (score >= 70) return "low";
  if (score >= 45) return "medium";
  return "high";
};

const detectSensitiveLeak = (raw: unknown): boolean => {
  const text = JSON.stringify(raw ?? "");
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) ||
    /\b(?:\d[ -]*?){13,19}\b/.test(text) ||
    /\b\d{3}-\d{2}-\d{4}\b/.test(text);
};

const percentile = (values: number[], p: number): number | null => {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
};

export const governanceRoutes: FastifyPluginAsync = async (app) => {
  app.get("/privacy/settings", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = propertyScopedQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid privacy query", issues: query.error.flatten() });
    }

    const property = await assertPropertyAccess(userId, query.data.propertyId);
    if (query.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const setting = await prisma.privacySetting.findFirst({
      where: {
        userId,
        propertyId: query.data.propertyId ?? null
      }
    }) ?? await prisma.privacySetting.create({
      data: defaultPrivacySettings({
        userId,
        propertyId: query.data.propertyId,
        domainAllowlist: property ? [property.domain] : []
      })
    });

    return reply.send(normalizePrivacySetting(setting));
  });

  app.patch("/privacy/settings", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = privacySettingUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid privacy settings", issues: parseResult.error.flatten() });
    }

    const property = await assertPropertyAccess(userId, parseResult.data.propertyId);
    if (parseResult.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const propertyId = parseResult.data.propertyId ?? null;
    const existing = await prisma.privacySetting.findFirst({
      where: { userId, propertyId }
    });
    const payload = {
      ...parseResult.data,
      propertyId
    } as Omit<typeof parseResult.data, "domainAllowlist" | "sensitiveSelectors"> & {
      propertyId: string | null;
      domainAllowlist?: InputJsonValue;
      sensitiveSelectors?: InputJsonValue;
    };
    if (parseResult.data.domainAllowlist !== undefined) {
      payload.domainAllowlist = parseResult.data.domainAllowlist;
    }
    if (parseResult.data.sensitiveSelectors !== undefined) {
      payload.sensitiveSelectors = parseResult.data.sensitiveSelectors;
    }

    const updated = existing
      ? await prisma.privacySetting.update({
          where: { id: existing.id },
          data: payload
        })
      : await prisma.privacySetting.create({
          data: {
            ...defaultPrivacySettings({
              userId,
              propertyId,
              domainAllowlist: property ? [property.domain] : []
            }),
            ...payload
          }
        });

    await logAudit({
      userId,
      action: "privacy_settings.updated",
      targetType: "privacy_setting",
      targetId: updated.id,
      metadata: { propertyId }
    });

    return reply.send(normalizePrivacySetting(updated));
  });

  app.get("/privacy/audit", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = daysQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid privacy audit query", issues: query.error.flatten() });
    }

    const property = await assertPropertyAccess(userId, query.data.propertyId);
    if (query.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const since = getWindowStart(query.data.days);
    const [setting, events, recordings, apiKeys] = await Promise.all([
      prisma.privacySetting.findFirst({ where: { userId, propertyId: query.data.propertyId ?? null } }),
      prisma.frictionEvent.findMany({
        where: { userId, ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}), createdAt: { gte: since } },
        take: 1000,
        orderBy: { createdAt: "desc" },
        select: { eventType: true, metadata: true, pageUrl: true, createdAt: true }
      }),
      prisma.sessionRecording.findMany({
        where: { ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}) },
        take: 250,
        orderBy: { createdAt: "desc" },
        select: { id: true, metadata: true, createdAt: true }
      }),
      prisma.apiKey.findMany({
        where: { userId, ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}) },
        select: { id: true, keyName: true, allowedDomains: true, isActive: true }
      })
    ]);

    const sensitiveFindings = events.filter((event) => detectSensitiveLeak(event.metadata));
    const redactedEvents = events.filter((event) => JSON.stringify(event.metadata ?? "").includes("[redacted]"));
    const unrestrictedKeys = apiKeys.filter((key) => key.isActive && asArray(key.allowedDomains).length === 0);
    const screenshotsAllowed = Boolean(setting?.allowScreenshots);
    const score = clamp(
      100 -
        sensitiveFindings.length * 8 -
        unrestrictedKeys.length * 12 -
        (screenshotsAllowed ? 10 : 0) -
        (setting?.captureQueryString ? 8 : 0) -
        (setting?.captureUrlHash ? 8 : 0),
      0,
      100
    );

    return reply.send({
      generatedAt: nowIso(),
      windowDays: query.data.days,
      propertyId: query.data.propertyId ?? null,
      score,
      risk: riskTone(score),
      dataCollected: [
        "page URLs without query string by default",
        "page views and route changes",
        "click, rage-click, dead-click, form validation, scroll-depth, performance, and JavaScript error signals",
        "sampled session recordings when enabled",
        "redacted DOM metadata and selector-level interaction context"
      ],
      settings: setting ? normalizePrivacySetting(setting) : null,
      findings: {
        inspectedEvents: events.length,
        redactedEvents: redactedEvents.length,
        potentialSensitiveMetadata: sensitiveFindings.length,
        unrestrictedActiveKeys: unrestrictedKeys.length,
        recentRecordings: recordings.length
      },
      recommendations: [
        ...(setting?.requireConsent ? [] : ["Enable consent mode for regulated or authenticated experiences."]),
        ...(unrestrictedKeys.length > 0 ? ["Restrict every active SDK key to approved production/staging domains."] : []),
        ...(sensitiveFindings.length > 0 ? ["Review recent metadata samples; potential raw sensitive values were detected."] : []),
        ...(screenshotsAllowed ? ["Keep screenshots disabled on money movement, card, banking, identity, and account settings screens."] : [])
      ]
    });
  });

  app.get("/setup/check", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = propertyScopedQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid setup check query", issues: query.error.flatten() });
    }

    const property = await assertPropertyAccess(userId, query.data.propertyId);
    if (query.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const since = getWindowStart(7);
    const propertyFilter = query.data.propertyId ? { propertyId: query.data.propertyId } : {};
    const [keys, latestEvent, recentEvents, performanceCount, privacySetting, definitions] = await Promise.all([
      prisma.apiKey.findMany({
        where: { userId, ...propertyFilter },
        select: { id: true, isActive: true, allowedDomains: true, lastUsedAt: true, keyName: true }
      }),
      prisma.frictionEvent.findFirst({
        where: { userId, ...propertyFilter },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, sdkVersion: true, schemaVersion: true, source: true }
      }),
      prisma.frictionEvent.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since } },
        take: 1000,
        select: { eventType: true, eventId: true, eventTimestamp: true, sdkVersion: true, source: true }
      }),
      prisma.performanceMetric.count({
        where: { userId, ...propertyFilter, createdAt: { gte: since } }
      }),
      prisma.privacySetting.findFirst({ where: { userId, propertyId: query.data.propertyId ?? null } }),
      prisma.eventDefinition.count({ where: { userId, ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}) } })
    ]);

    const activeKeys = keys.filter((key) => key.isActive);
    const eventIdCoverage = recentEvents.length > 0
      ? round((recentEvents.filter((event) => event.eventId).length / recentEvents.length) * 100, 1)
      : 0;
    const timestampCoverage = recentEvents.length > 0
      ? round((recentEvents.filter((event) => event.eventTimestamp).length / recentEvents.length) * 100, 1)
      : 0;
    const checks = [
      {
        id: "property",
        label: query.data.propertyId ? "Property selected" : "Global analytics view",
        status: query.data.propertyId ? "pass" : "warn",
        detail: query.data.propertyId ? "Setup checker is scoped to one property." : "Pick one property for the clearest install diagnosis."
      },
      {
        id: "active_key",
        label: "Active SDK key",
        status: activeKeys.length > 0 ? "pass" : "fail",
        detail: activeKeys.length > 0 ? `${activeKeys.length} active key(s) available.` : "Create an active key before installing the snippet."
      },
      {
        id: "domain_restrictions",
        label: "Domain restrictions",
        status: activeKeys.some((key) => asArray(key.allowedDomains).length > 0) ? "pass" : "warn",
        detail: "Production keys should include explicit allowed domains."
      },
      {
        id: "traffic",
        label: "Recent traffic",
        status: recentEvents.length > 0 ? "pass" : "fail",
        detail: recentEvents.length > 0 ? `${recentEvents.length} recent events received.` : "Open the installed app after adding the snippet."
      },
      {
        id: "pageviews",
        label: "Page views",
        status: recentEvents.some((event) => event.eventType === "page_view") ? "pass" : "warn",
        detail: "The SDK should send page_view on initial load and SPA route changes."
      },
      {
        id: "performance",
        label: "Performance telemetry",
        status: performanceCount > 0 ? "pass" : "warn",
        detail: performanceCount > 0 ? `${performanceCount} performance metrics received.` : "No web-vital or load metrics have arrived yet."
      },
      {
        id: "event_ids",
        label: "Duplicate protection",
        status: eventIdCoverage >= 95 ? "pass" : eventIdCoverage > 0 ? "warn" : "fail",
        detail: `${eventIdCoverage}% of recent events include eventId.`
      },
      {
        id: "timestamps",
        label: "Client timestamps",
        status: timestampCoverage >= 95 ? "pass" : timestampCoverage > 0 ? "warn" : "fail",
        detail: `${timestampCoverage}% of recent events include client timestamps.`
      },
      {
        id: "privacy",
        label: "Privacy policy",
        status: privacySetting ? "pass" : "warn",
        detail: privacySetting ? "Collection settings are saved." : "Review privacy settings before production rollout."
      },
      {
        id: "taxonomy",
        label: "Event taxonomy",
        status: definitions > 0 ? "pass" : "warn",
        detail: definitions > 0 ? `${definitions} event definition(s) configured.` : "Define key events before measuring funnels."
      }
    ];
    const passCount = checks.filter((check) => check.status === "pass").length;
    const score = Math.round((passCount / checks.length) * 100);

    return reply.send({
      generatedAt: nowIso(),
      propertyId: query.data.propertyId ?? null,
      score,
      readyForProduction: score >= 80 && recentEvents.length > 0,
      lastSignalAt: compactDate(latestEvent?.createdAt),
      sdkVersion: latestEvent?.sdkVersion ?? null,
      schemaVersion: latestEvent?.schemaVersion ?? null,
      checks
    });
  });

  app.get("/event-definitions", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = propertyScopedQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid taxonomy query", issues: query.error.flatten() });
    }

    const definitions = await prisma.eventDefinition.findMany({
      where: { userId, ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}) },
      orderBy: [{ status: "asc" }, { eventName: "asc" }]
    });

    return reply.send(definitions.map((definition) => ({
      ...definition,
      requiredProperties: asArray(definition.requiredProperties),
      optionalProperties: asArray(definition.optionalProperties),
      createdAt: definition.createdAt.toISOString(),
      updatedAt: definition.updatedAt.toISOString()
    })));
  });

  app.post("/event-definitions", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = eventDefinitionSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid event definition", issues: parseResult.error.flatten() });
    }

    const property = await assertPropertyAccess(userId, parseResult.data.propertyId);
    if (parseResult.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const created = await prisma.eventDefinition.create({
      data: {
        userId,
        propertyId: parseResult.data.propertyId ?? null,
        eventName: parseResult.data.eventName,
        displayName: parseResult.data.displayName,
        description: parseResult.data.description,
        category: parseResult.data.category,
        status: parseResult.data.status,
        owner: parseResult.data.owner,
        requiredProperties: parseResult.data.requiredProperties as InputJsonValue,
        optionalProperties: parseResult.data.optionalProperties as InputJsonValue,
        conversionEvent: parseResult.data.conversionEvent,
        piiRisk: parseResult.data.piiRisk
      }
    });

    await logAudit({
      userId,
      action: "event_definition.created",
      targetType: "event_definition",
      targetId: created.id,
      metadata: { eventName: created.eventName, propertyId: created.propertyId }
    });

    return reply.code(201).send(created);
  });

  app.patch("/event-definitions/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = idParamSchema.safeParse(request.params);
    const parseResult = eventDefinitionUpdateSchema.safeParse(request.body);
    if (!params.success || !parseResult.success) {
      return reply.code(400).send({ message: "Invalid event definition update" });
    }

    const existing = await prisma.eventDefinition.findFirst({ where: { id: params.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "Event definition not found" });
    }

    const updated = await prisma.eventDefinition.update({
      where: { id: existing.id },
      data: {
        ...parseResult.data,
        propertyId: parseResult.data.propertyId === undefined ? undefined : parseResult.data.propertyId,
        requiredProperties: parseResult.data.requiredProperties as InputJsonValue | undefined,
        optionalProperties: parseResult.data.optionalProperties as InputJsonValue | undefined
      }
    });

    await logAudit({
      userId,
      action: "event_definition.updated",
      targetType: "event_definition",
      targetId: updated.id,
      metadata: { eventName: updated.eventName }
    });

    return reply.send(updated);
  });

  app.delete("/event-definitions/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = idParamSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid event definition id" });
    }

    const existing = await prisma.eventDefinition.findFirst({ where: { id: params.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "Event definition not found" });
    }

    await prisma.eventDefinition.delete({ where: { id: existing.id } });
    await logAudit({
      userId,
      action: "event_definition.deleted",
      targetType: "event_definition",
      targetId: existing.id,
      metadata: { eventName: existing.eventName }
    });

    return reply.send({ ok: true });
  });

  app.get("/collection/observability", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = observabilityQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid observability query", issues: query.error.flatten() });
    }

    const since = getHourWindowStart(query.data.hours);
    const propertyFilter = query.data.propertyId ? { propertyId: query.data.propertyId } : {};
    const [events, errors, performance, definitions, rateLimits] = await Promise.all([
      prisma.frictionEvent.findMany({
        where: { userId, ...propertyFilter, receivedAt: { gte: since } },
        take: 20_000,
        select: {
          eventType: true,
          eventId: true,
          eventTimestamp: true,
          receivedAt: true,
          source: true,
          schemaVersion: true,
          sdkVersion: true,
          urlHost: true
        }
      }),
      prisma.errorLog.count({ where: { userId, ...propertyFilter, createdAt: { gte: since } } }),
      prisma.performanceMetric.count({ where: { userId, ...propertyFilter, createdAt: { gte: since } } }),
      prisma.eventDefinition.findMany({
        where: { userId, ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}) },
        select: { eventName: true, status: true }
      }),
      prisma.rateLimit.findMany({
        where: { endpoint: "ingest-events", windowStart: { gte: since } },
        take: 1000
      })
    ]);

    const eventTypes = new Map<string, number>();
    const sdkVersions = new Map<string, number>();
    const schemaVersions = new Map<string, number>();
    const domains = new Map<string, number>();
    const delays = events
      .filter((event) => event.eventTimestamp)
      .map((event) => Math.max(0, event.receivedAt.getTime() - (event.eventTimestamp?.getTime() ?? event.receivedAt.getTime())));

    for (const event of events) {
      eventTypes.set(event.eventType, (eventTypes.get(event.eventType) ?? 0) + 1);
      if (event.sdkVersion) {
        sdkVersions.set(event.sdkVersion, (sdkVersions.get(event.sdkVersion) ?? 0) + 1);
      }
      schemaVersions.set(String(event.schemaVersion), (schemaVersions.get(String(event.schemaVersion)) ?? 0) + 1);
      if (event.urlHost) {
        domains.set(event.urlHost, (domains.get(event.urlHost) ?? 0) + 1);
      }
    }

    const definedEventNames = new Set(definitions.filter((definition) => definition.status === "active").map((definition) => definition.eventName));
    const unknownEvents = [...eventTypes.entries()]
      .filter(([eventType]) => !definedEventNames.has(eventType) && !["page_view", "click", "scroll_depth", "performance", "javascript_error", "rage_click", "dead_click", "form_validation_error"].includes(eventType))
      .map(([eventType, count]) => ({ eventType, count }));
    const idCoverage = events.length > 0 ? round((events.filter((event) => event.eventId).length / events.length) * 100, 1) : 0;
    const timestampCoverage = events.length > 0 ? round((events.filter((event) => event.eventTimestamp).length / events.length) * 100, 1) : 0;
    const sdkCoverage = events.length > 0 ? round((events.filter((event) => event.source === "sdk_browser").length / events.length) * 100, 1) : 0;
    const queueDelayP50 = percentile(delays, 50);
    const queueDelayP95 = percentile(delays, 95);
    const score = clamp(
      Math.round(
        (events.length > 0 ? 25 : 0) +
          (idCoverage >= 95 ? 20 : idCoverage / 5) +
          (timestampCoverage >= 95 ? 15 : timestampCoverage / 7) +
          (sdkCoverage >= 80 ? 15 : sdkCoverage / 6) +
          (performance > 0 ? 10 : 0) +
          (unknownEvents.length === 0 ? 10 : 0) +
          (queueDelayP95 === null || queueDelayP95 < 30_000 ? 5 : 0)
      ),
      0,
      100
    );

    return reply.send({
      generatedAt: nowIso(),
      propertyId: query.data.propertyId ?? null,
      windowHours: query.data.hours,
      score,
      health: score >= 80 ? "healthy" : score >= 60 ? "watch" : "needs_attention",
      totals: {
        events: events.length,
        errors,
        performanceMetrics: performance,
        rateLimitWindows: rateLimits.length
      },
      quality: {
        eventIdCoverage: idCoverage,
        timestampCoverage,
        sdkEventCoverage: sdkCoverage,
        queueDelayP50Ms: queueDelayP50,
        queueDelayP95Ms: queueDelayP95
      },
      eventTypes: [...eventTypes.entries()].map(([eventType, count]) => ({ eventType, count })).sort((a, b) => b.count - a.count),
      sdkVersions: [...sdkVersions.entries()].map(([version, count]) => ({ version, count })),
      schemaVersions: [...schemaVersions.entries()].map(([version, count]) => ({ version, count })),
      domains: [...domains.entries()].map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count),
      unknownEvents,
      recommendations: [
        ...(events.length === 0 ? ["No events in this window. Verify snippet install and ad/script blockers."] : []),
        ...(idCoverage < 95 ? ["Upgrade all installs to SDK 0.4.0+ so event IDs are always present."] : []),
        ...(unknownEvents.length > 0 ? ["Add definitions for unknown product events or fix typos in custom event names."] : []),
        ...(queueDelayP95 !== null && queueDelayP95 >= 30_000 ? ["Queue delay is high; check browser offline behavior, CSP, and ingest availability."] : [])
      ]
    });
  });

  app.get("/security/posture", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const [keys, audits, privacySettings] = await Promise.all([
      prisma.apiKey.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          keyName: true,
          keyPrefix: true,
          isActive: true,
          allowedDomains: true,
          lastUsedAt: true,
          createdAt: true,
          property: { select: { id: true, name: true, domain: true } }
        }
      }),
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.privacySetting.findMany({ where: { userId } })
    ]);

    const keyFindings = keys.map((key) => {
      const ageDays = Math.floor((Date.now() - key.createdAt.getTime()) / 86_400_000);
      const allowedDomains = asArray(key.allowedDomains);
      return {
        id: key.id,
        keyName: key.keyName,
        keyPrefix: key.keyPrefix,
        isActive: key.isActive,
        property: key.property,
        ageDays,
        allowedDomains,
        lastUsedAt: compactDate(key.lastUsedAt),
        needsRotation: ageDays >= 90,
        unrestricted: allowedDomains.length === 0
      };
    });
    const activeKeys = keyFindings.filter((key) => key.isActive);
    const oldKeys = activeKeys.filter((key) => key.needsRotation).length;
    const unrestrictedKeys = activeKeys.filter((key) => key.unrestricted).length;
    const privacyGaps = privacySettings.filter((setting) => !setting.redactText || setting.captureQueryString || setting.captureUrlHash || setting.allowScreenshots).length;
    const score = clamp(100 - oldKeys * 10 - unrestrictedKeys * 15 - privacyGaps * 8, 0, 100);

    return reply.send({
      generatedAt: nowIso(),
      score,
      posture: score >= 85 ? "strong" : score >= 65 ? "needs_review" : "at_risk",
      counts: {
        activeKeys: activeKeys.length,
        oldKeys,
        unrestrictedKeys,
        privacyGaps,
        auditEvents: audits.length
      },
      keys: keyFindings,
      recentAudit: audits.map((audit) => ({
        id: audit.id,
        action: audit.action,
        targetType: audit.targetType,
        targetId: audit.targetId,
        createdAt: audit.createdAt.toISOString(),
        metadata: audit.metadata
      })),
      recommendations: [
        ...(oldKeys > 0 ? ["Rotate API keys older than 90 days."] : []),
        ...(unrestrictedKeys > 0 ? ["Add domain restrictions to every active SDK key."] : []),
        ...(privacyGaps > 0 ? ["Review privacy settings with screenshots, URL query capture, or non-redacted text enabled."] : []),
        "Keep API keys scoped to one property and environment whenever possible."
      ]
    });
  });

  app.post("/api-keys/:id/rotate", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = idParamSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ message: "Invalid API key id" });
    }

    const existing = await prisma.apiKey.findFirst({ where: { id: params.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "API key not found" });
    }

    const generated = generateApiKey();
    const created = await prisma.$transaction(async (tx) => {
      await tx.apiKey.update({
        where: { id: existing.id },
        data: { isActive: false }
      });

      return tx.apiKey.create({
        data: {
          userId,
          propertyId: existing.propertyId,
          keyName: `${existing.keyName} rotated`,
          keyHash: generated.hash,
          keyPrefix: generated.keyPrefix,
          allowedDomains: existing.allowedDomains as InputJsonValue,
          isActive: true
        }
      });
    });

    await logAudit({
      userId,
      action: "api_key.rotated",
      targetType: "api_key",
      targetId: existing.id,
      metadata: { replacementKeyId: created.id, propertyId: existing.propertyId }
    });

    return reply.code(201).send({
      id: created.id,
      propertyId: created.propertyId,
      keyName: created.keyName,
      keyPrefix: created.keyPrefix,
      isActive: created.isActive,
      allowedDomains: asArray(created.allowedDomains),
      createdAt: created.createdAt.toISOString(),
      apiKey: generated.plain
    });
  });

  app.get("/export-destinations", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const destinations = await prisma.exportDestination.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return reply.send(destinations.map((destination) => ({
      ...destination,
      createdAt: destination.createdAt.toISOString(),
      updatedAt: destination.updatedAt.toISOString(),
      lastRunAt: compactDate(destination.lastRunAt)
    })));
  });

  app.post("/export-destinations", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = exportDestinationSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid export destination", issues: parseResult.error.flatten() });
    }

    const created = await prisma.exportDestination.create({
      data: {
        userId,
        name: parseResult.data.name,
        destinationType: parseResult.data.destinationType,
        cadence: parseResult.data.cadence,
        config: parseResult.data.config as InputJsonValue,
        isActive: parseResult.data.isActive
      }
    });

    await logAudit({
      userId,
      action: "export_destination.created",
      targetType: "export_destination",
      targetId: created.id,
      metadata: { destinationType: created.destinationType, cadence: created.cadence }
    });

    return reply.code(201).send(created);
  });

  app.patch("/export-destinations/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const params = idParamSchema.safeParse(request.params);
    const parseResult = exportDestinationUpdateSchema.safeParse(request.body);
    if (!params.success || !parseResult.success) {
      return reply.code(400).send({ message: "Invalid export destination update" });
    }

    const existing = await prisma.exportDestination.findFirst({ where: { id: params.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "Export destination not found" });
    }

    const updated = await prisma.exportDestination.update({
      where: { id: existing.id },
      data: {
        ...parseResult.data,
        config: parseResult.data.config as InputJsonValue | undefined
      }
    });

    await logAudit({
      userId,
      action: "export_destination.updated",
      targetType: "export_destination",
      targetId: updated.id
    });

    return reply.send(updated);
  });

  app.post("/api/export-csv", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = exportCsvSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid CSV export payload", issues: parseResult.error.flatten() });
    }

    const property = await assertPropertyAccess(userId, parseResult.data.propertyId);
    if (parseResult.data.propertyId && !property) {
      return reply.code(404).send({ message: "Property not found" });
    }

    const since = getWindowStart(parseResult.data.days);
    const propertyFilter = parseResult.data.propertyId ? { propertyId: parseResult.data.propertyId } : {};
    let rows: Array<Record<string, unknown>> = [];

    if (parseResult.data.exportType === "errors") {
      const errors = await prisma.errorLog.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10_000
      });
      rows = errors.map((error) => ({
        id: error.id,
        errorType: error.errorType,
        severity: error.severity,
        pageUrl: error.pageUrl,
        createdAt: error.createdAt
      }));
    } else if (parseResult.data.exportType === "performance") {
      const metrics = await prisma.performanceMetric.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10_000
      });
      rows = metrics.map((metric) => ({
        id: metric.id,
        metricName: metric.metricName,
        metricValue: metric.metricValue,
        pageUrl: metric.pageUrl,
        createdAt: metric.createdAt
      }));
    } else if (parseResult.data.exportType === "taxonomy") {
      const definitions = await prisma.eventDefinition.findMany({
        where: { userId, ...propertyFilter },
        orderBy: { eventName: "asc" }
      });
      rows = definitions.map((definition) => ({
        id: definition.id,
        eventName: definition.eventName,
        category: definition.category,
        status: definition.status,
        conversionEvent: definition.conversionEvent,
        piiRisk: definition.piiRisk,
        requiredProperties: asArray(definition.requiredProperties).join("|")
      }));
    } else {
      const events = await prisma.frictionEvent.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10_000
      });
      rows = events.map((event) => ({
        id: event.id,
        eventId: event.eventId,
        eventType: event.eventType,
        pageUrl: event.pageUrl,
        sessionId: event.sessionId,
        severityScore: event.severityScore,
        sdkVersion: event.sdkVersion,
        schemaVersion: event.schemaVersion,
        eventTimestamp: event.eventTimestamp,
        receivedAt: event.receivedAt,
        createdAt: event.createdAt
      }));
    }

    const csv = rowsToCsv(rows);
    const storagePath = `exports/${userId}/${parseResult.data.exportType}-${Date.now()}.csv`;
    await uploadObject({
      key: storagePath,
      body: Buffer.from(csv, "utf8"),
      contentType: "text/csv"
    });

    await prisma.exportJob.create({
      data: {
        userId,
        exportType: "csv",
        status: "completed",
        storagePath,
        parameters: parseResult.data as InputJsonValue,
        completedAt: new Date()
      }
    });

    await logAudit({
      userId,
      action: "export.csv.created",
      targetType: "export_job",
      metadata: { exportType: parseResult.data.exportType, rows: rows.length }
    });

    return reply.code(202).send({
      ok: true,
      rows: rows.length,
      downloadUrl: `/exports/${encodeURIComponent(storagePath)}`
    });
  });

  app.get("/analytics/opportunities", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = daysQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid opportunities query", issues: query.error.flatten() });
    }

    const since = getWindowStart(query.data.days);
    const propertyFilter = query.data.propertyId ? { propertyId: query.data.propertyId } : {};
    const [events, errors, performance] = await Promise.all([
      prisma.frictionEvent.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since } },
        take: 10_000,
        select: { eventType: true, pageUrl: true, severityScore: true, sessionId: true, createdAt: true }
      }),
      prisma.errorLog.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since } },
        take: 5_000,
        select: { pageUrl: true, severity: true }
      }),
      prisma.performanceMetric.findMany({
        where: { userId, ...propertyFilter, createdAt: { gte: since }, metricName: "page_load_time" },
        take: 5_000,
        select: { pageUrl: true, metricValue: true }
      })
    ]);

    const pages = new Map<string, {
      pageUrl: string;
      events: number;
      highFriction: number;
      sessions: Set<string>;
      errors: number;
      loadSamples: number[];
    }>();
    const getPage = (pageUrl: string | null | undefined) => {
      const key = pageUrl || "unknown";
      const existing = pages.get(key) ?? {
        pageUrl: key,
        events: 0,
        highFriction: 0,
        sessions: new Set<string>(),
        errors: 0,
        loadSamples: []
      };
      pages.set(key, existing);
      return existing;
    };

    for (const event of events) {
      const page = getPage(event.pageUrl);
      page.events += 1;
      page.sessions.add(event.sessionId);
      if (event.severityScore >= 7 || event.eventType.includes("rage") || event.eventType.includes("dead")) {
        page.highFriction += 1;
      }
    }

    for (const error of errors) {
      getPage(error.pageUrl).errors += 1;
    }

    for (const metric of performance) {
      getPage(metric.pageUrl).loadSamples.push(metric.metricValue);
    }

    const opportunities = [...pages.values()]
      .map((page) => {
        const avgLoad = page.loadSamples.length > 0
          ? page.loadSamples.reduce((sum, value) => sum + value, 0) / page.loadSamples.length
          : null;
        const impact = page.highFriction * 8 + page.errors * 10 + (avgLoad && avgLoad > 2500 ? 12 : 0) + page.sessions.size;
        const reason = page.errors > 0
          ? "Errors are colliding with user behavior on this surface."
          : page.highFriction > 0
            ? "Repeated friction signals suggest users are struggling here."
            : avgLoad && avgLoad > 2500
              ? "Slow load time is likely increasing abandonment risk."
              : "High traffic surface with room for instrumentation depth.";

        return {
          id: page.pageUrl,
          pageUrl: page.pageUrl,
          impactScore: Math.round(impact),
          events: page.events,
          sessions: page.sessions.size,
          highFriction: page.highFriction,
          errors: page.errors,
          averageLoadMs: avgLoad === null ? null : Math.round(avgLoad),
          recommendation: reason
        };
      })
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 8);

    return reply.send({
      generatedAt: nowIso(),
      propertyId: query.data.propertyId ?? null,
      windowDays: query.data.days,
      opportunities
    });
  });

  app.get("/recording-insights", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const query = propertyScopedQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ message: "Invalid recording insights query", issues: query.error.flatten() });
    }

    const recordings = await prisma.sessionRecording.findMany({
      where: { ...(query.data.propertyId ? { propertyId: query.data.propertyId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        sessionId: true,
        durationSeconds: true,
        frictionEventsCount: true,
        fileSizeBytes: true,
        metadata: true,
        createdAt: true
      }
    });

    const owned = recordings.filter((recording) => {
      const metadata = asObject(recording.metadata);
      return metadata.userId === userId || recording.sessionId.startsWith(userId.slice(0, 8));
    });
    const totalDuration = owned.reduce((sum, recording) => sum + (recording.durationSeconds ?? 0), 0);
    const frictionRecordings = owned.filter((recording) => recording.frictionEventsCount > 0);
    const replaySearch = owned
      .filter((recording) => recording.frictionEventsCount > 0)
      .slice(0, 10)
      .map((recording) => ({
        id: recording.id,
        sessionId: recording.sessionId,
        frictionEventsCount: recording.frictionEventsCount,
        durationSeconds: recording.durationSeconds,
        createdAt: recording.createdAt.toISOString(),
        pageUrl: asObject(recording.metadata).pageUrl ?? null
      }));

    return reply.send({
      generatedAt: nowIso(),
      propertyId: query.data.propertyId ?? null,
      summary: {
        recordings: owned.length,
        frictionRecordings: frictionRecordings.length,
        averageDurationSeconds: owned.length > 0 ? Math.round(totalDuration / owned.length) : 0,
        totalSizeBytes: owned.reduce((sum, recording) => sum + Number(recording.fileSizeBytes ?? 0), 0)
      },
      controls: {
        sampling: "Use data-sample-rate on the snippet or privacy settings recordingSampleRate.",
        masking: "Text, inputs, and data-nudgr-redact/data-private/data-sensitive selectors are masked before upload.",
        retention: "Recording metadata follows the saved privacy retention policy."
      },
      replaySearch
    });
  });
};
