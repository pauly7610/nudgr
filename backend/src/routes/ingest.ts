import type { FastifyPluginAsync } from "fastify";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import { createHash } from "node:crypto";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { uploadObject } from "../lib/storage.js";
import { AUTH_DISABLED_USER } from "../plugins/auth.js";

const MAX_INGEST_BATCH_SIZE = 100;
const INGEST_RATE_LIMIT_WINDOW_MS = 60_000;
const INGEST_RATE_LIMIT_MAX_REQUESTS = 120;
const SENSITIVE_KEY_RE = /(password|passwd|secret|token|jwt|session|cookie|auth|card|cc|cvv|cvc|ssn|social|dob|birth|bank|routing|account|pin|otp|mfa|email|phone|address|name)/i;

const ingestEventSchema = z.object({
  type: z.string().trim().min(1).max(80),
  sessionId: z.string().trim().min(1).max(160).optional(),
  timestamp: z.number().int().positive().optional(),
  eventId: z.string().trim().min(1).max(160).optional(),
  schemaVersion: z.coerce.number().int().min(1).max(10).default(1),
  sdkVersion: z.string().trim().max(40).optional(),
  data: z.record(z.string(), z.unknown()).optional()
});

const ingestPayloadSchema = z.object({
  events: z.array(ingestEventSchema).min(1).max(MAX_INGEST_BATCH_SIZE)
});

const sdkSessionSchema = z.object({
  sessionId: z.string().min(1),
  siteUserId: z.string().min(1).max(120).optional(),
  pageUrl: z.string().url().optional(),
  userAgent: z.string().max(512).optional()
});

const getFieldValue = (
  fields: Record<string, unknown>,
  key: string
): string | undefined => {
  const field = fields[key];
  if (!field || Array.isArray(field) || typeof field !== "object") {
    return undefined;
  }

  const maybeValue = (field as { value?: unknown }).value;
  return typeof maybeValue === "string" ? maybeValue : undefined;
};

const getHeaderValue = (header: string | string[] | undefined): string | undefined => {
  if (typeof header === "string") {
    return header;
  }

  if (Array.isArray(header)) {
    return header[0];
  }

  return undefined;
};

const hashApiKey = (plain: string): string => {
  return createHash("sha256").update(plain).digest("hex");
};

const hostFromUrl = (raw: string | undefined): string | null => {
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
};

const hostMatchesAllowedDomain = (host: string, allowedDomain: string): boolean => {
  const candidate = allowedDomain.trim().toLowerCase();
  if (!candidate) {
    return false;
  }

  const normalizedCandidate = candidate.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (normalizedCandidate.startsWith("*.")) {
    const baseDomain = normalizedCandidate.slice(2);
    return host === baseDomain || host.endsWith(`.${baseDomain}`);
  }

  return host === normalizedCandidate;
};

const asStringArray = (raw: unknown): string[] => {
  return Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === "string")
    : [];
};

const asRecord = (raw: unknown): Record<string, unknown> => {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};
};

const clampInt = (value: unknown, min: number, max: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const truncate = (value: unknown, maxLength: number): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[redacted-card]")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[redacted-ssn]")
    .slice(0, maxLength);
};

const sanitizeMetadata = (value: unknown, depth = 0): unknown => {
  if (depth > 4) {
    return "[truncated]";
  }

  if (value === undefined) {
    return null;
  }

  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return truncate(value, 1000);
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeMetadata(item, depth + 1));
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value).slice(0, 100)) {
      output[truncate(key, 80)] = SENSITIVE_KEY_RE.test(key)
        ? "[redacted]"
        : sanitizeMetadata(nestedValue, depth + 1);
    }
    return output;
  }

  return truncate(String(value), 1000);
};

const eventDateFromTimestamp = (timestamp: number | undefined): Date | null => {
  if (!timestamp) {
    return null;
  }

  const milliseconds = timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : date;
};

const urlParts = (rawPageUrl: string): { urlHost: string | null; urlPath: string | null } => {
  try {
    const parsed = new URL(rawPageUrl);
    return {
      urlHost: parsed.hostname,
      urlPath: `${parsed.pathname}${parsed.search}`
    };
  } catch {
    return {
      urlHost: null,
      urlPath: null
    };
  }
};

const isAllowedOrigin = (params: {
  allowedDomains: string[];
  originHeader?: string;
  refererHeader?: string;
}): boolean => {
  if (params.allowedDomains.length === 0) {
    return true;
  }

  const originHost = hostFromUrl(params.originHeader);
  const refererHost = hostFromUrl(params.refererHeader);
  const sourceHosts = [originHost, refererHost].filter((value): value is string => Boolean(value));

  if (sourceHosts.length === 0) {
    return false;
  }

  return sourceHosts.some((host) => params.allowedDomains.some((domain) => hostMatchesAllowedDomain(host, domain)));
};

const findActiveApiKey = async (plainApiKey: string) => {
  return prisma.apiKey.findFirst({
    where: {
      keyHash: hashApiKey(plainApiKey),
      isActive: true
    },
    select: {
      id: true,
      userId: true,
      propertyId: true,
      allowedDomains: true
    }
  });
};

type ResolvedIngestIdentity =
  | {
      authType: "jwt";
      userId: string;
    }
  | {
      authType: "sdk";
      userId: string;
      apiKeyId: string;
      propertyId: string | null;
      sessionId: string;
    };

const resolveIdentity = async (
  app: {
    jwt: {
      verify: <T>(token: string) => Promise<T>;
    };
  },
  headers: {
    authorization?: string | string[];
    "x-api-key"?: string | string[];
    "x-sdk-session-token"?: string | string[];
  }
): Promise<ResolvedIngestIdentity | null> => {
  const authorization = getHeaderValue(headers.authorization);
  if (authorization?.startsWith("Bearer ")) {
    const jwtToken = authorization.slice("Bearer ".length);
    try {
      const payload = await app.jwt.verify<{ sub?: string }>(jwtToken);
      if (payload.sub) {
        return {
          authType: "jwt",
          userId: payload.sub
        };
      }
    } catch {
      // continue and attempt SDK auth fallback
    }
  }

  const apiKey = getHeaderValue(headers["x-api-key"]);
  const sdkSessionToken = getHeaderValue(headers["x-sdk-session-token"]);

  if (!apiKey || !sdkSessionToken) {
    return env.DISABLE_AUTH
      ? {
          authType: "jwt",
          userId: AUTH_DISABLED_USER.sub
        }
      : null;
  }

  const activeKey = await findActiveApiKey(apiKey);
  if (!activeKey) {
    return env.DISABLE_AUTH
      ? {
          authType: "jwt",
          userId: AUTH_DISABLED_USER.sub
        }
      : null;
  }

  try {
    const payload = await app.jwt.verify<{
      type?: string;
      apiKeyId?: string;
      propertyId?: string | null;
      sessionId?: string;
    }>(sdkSessionToken);

    if (payload.type !== "sdk_session" || payload.apiKeyId !== activeKey.id || !payload.sessionId) {
      return null;
    }

    return {
      authType: "sdk",
      userId: activeKey.userId,
      apiKeyId: activeKey.id,
      propertyId: activeKey.propertyId ?? null,
      sessionId: payload.sessionId
    };
  } catch {
    return null;
  }
};

const enforceSdkRateLimit = async (identity: ResolvedIngestIdentity): Promise<boolean> => {
  if (identity.authType !== "sdk" || env.NODE_ENV === "test") {
    return true;
  }

  const identifier = `sdk:${identity.apiKeyId}`;
  const endpoint = "ingest-events";
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({
    where: {
      identifier_endpoint: {
        identifier,
        endpoint
      }
    }
  });

  if (!existing) {
    await prisma.rateLimit.create({
      data: {
        identifier,
        endpoint,
        requestCount: 1,
        windowStart: now
      }
    });
    return true;
  }

  const windowAgeMs = now.getTime() - existing.windowStart.getTime();
  if (windowAgeMs > INGEST_RATE_LIMIT_WINDOW_MS) {
    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: {
        requestCount: 1,
        windowStart: now
      }
    });
    return true;
  }

  if (existing.requestCount >= INGEST_RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  await prisma.rateLimit.update({
    where: { id: existing.id },
    data: {
      requestCount: {
        increment: 1
      }
    }
  });
  return true;
};

const isForbiddenJwtUpload = (identity: ResolvedIngestIdentity, requestedUserId: string): boolean => {
  if (identity.authType !== "jwt") {
    return false;
  }

  if (env.DISABLE_AUTH) {
    return Boolean(requestedUserId && requestedUserId !== identity.userId);
  }

  return !requestedUserId || requestedUserId !== identity.userId;
};

export const ingestRoutes: FastifyPluginAsync = async (app) => {
  app.post("/api/sdk/session", async (request, reply) => {
    const parseResult = sdkSessionSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid SDK session payload",
        issues: parseResult.error.flatten()
      });
    }

    const apiKey = getHeaderValue(request.headers["x-api-key"]);
    if (!apiKey) {
      return reply.code(401).send({ message: "Missing API key" });
    }

    const activeKey = await findActiveApiKey(apiKey);
    if (!activeKey) {
      return reply.code(401).send({ message: "Invalid or inactive API key" });
    }

    const originHeader = getHeaderValue(request.headers.origin);
    const refererHeader = getHeaderValue(request.headers.referer);
    if (!isAllowedOrigin({
      allowedDomains: asStringArray(activeKey.allowedDomains),
      originHeader,
      refererHeader
    })) {
      return reply.code(403).send({ message: "Origin not allowed for this API key" });
    }

    const sdkSessionToken = await app.jwt.sign(
      {
        type: "sdk_session",
        apiKeyId: activeKey.id,
        propertyId: activeKey.propertyId,
        sessionId: parseResult.data.sessionId,
        siteUserId: parseResult.data.siteUserId
      },
      {
        expiresIn: "12h"
      }
    );

    const seenAt = new Date();
    try {
      await Promise.all([
        prisma.apiKey.updateMany({
          where: { id: activeKey.id },
          data: { lastUsedAt: seenAt }
        }),
        activeKey.propertyId
          ? prisma.analyticsProperty.updateMany({
              where: { id: activeKey.propertyId },
              data: { lastSeenAt: seenAt }
            })
          : Promise.resolve()
      ]);
    } catch (error) {
      request.log.warn({ err: error, apiKeyId: activeKey.id }, "Failed to mark SDK key as seen");
    }

    return reply.code(201).send({
      ok: true,
      propertyId: activeKey.propertyId,
      sdkSessionToken,
      expiresInSeconds: 12 * 60 * 60
    });
  });

  app.post("/api/ingest-events", async (request, reply) => {
    const identity = await resolveIdentity(app, request.headers);
    if (!identity) {
      return reply.code(401).send({ message: "Unauthorized ingest request" });
    }

    const withinRateLimit = await enforceSdkRateLimit(identity);
    if (!withinRateLimit) {
      return reply
        .header("Retry-After", Math.ceil(INGEST_RATE_LIMIT_WINDOW_MS / 1000))
        .code(429)
        .send({ message: "Ingest rate limit exceeded" });
    }

    const parseResult = ingestPayloadSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid ingest payload",
        issues: parseResult.error.flatten()
      });
    }

    const frictionRecords = [];
    const performanceRecords = [];
    const errorRecords = [];

    for (const event of parseResult.data.events) {
      const data = asRecord(sanitizeMetadata(event.data ?? {}));
      const eventType = truncate(data.eventType ?? event.type, 80) || "unknown";
      const pageUrl = truncate(data.pageUrl ?? "unknown", 1000) || "unknown";
      const eventTimestamp = eventDateFromTimestamp(event.timestamp);
      const receivedAt = new Date();
      const severityScore = clampInt(data.severityScore, 0, 10);
      const schemaVersion = clampInt(data.schemaVersion ?? event.schemaVersion, 1, 10);
      const sdkVersion = truncate(data.sdkVersion ?? event.sdkVersion ?? "", 40) || null;
      const parts = urlParts(pageUrl);
      const baseMetadata = {
        eventId: event.eventId ?? null,
        timestamp: event.timestamp,
        eventTimestamp: eventTimestamp?.toISOString() ?? null,
        receivedAt: receivedAt.toISOString(),
        schemaVersion,
        sdkVersion,
        ingestAuthType: identity.authType,
        ...(identity.authType === "sdk"
          ? { ingestApiKeyId: identity.apiKeyId, ingestPropertyId: identity.propertyId }
          : {}),
        ...data
      };

      frictionRecords.push({
        userId: identity.userId,
        propertyId: identity.authType === "sdk" ? identity.propertyId : null,
        eventId: event.eventId ?? null,
        eventType,
        pageUrl,
        sessionId: event.sessionId ?? (identity.authType === "sdk" ? identity.sessionId : "unknown"),
        severityScore,
        eventTimestamp,
        receivedAt,
        createdAt: eventTimestamp ?? receivedAt,
        source: identity.authType === "sdk" ? "sdk_browser" : "server",
        schemaVersion,
        sdkVersion,
        urlHost: parts.urlHost,
        urlPath: parts.urlPath,
        metadata: baseMetadata as InputJsonValue
      });

      if (eventType === "performance" || data.loadTime !== undefined || data.fcp !== undefined || data.tti !== undefined) {
        const metricBase = {
          userId: identity.userId,
          propertyId: identity.authType === "sdk" ? identity.propertyId : null,
          pageUrl,
          userAgent: truncate(asRecord(data.metadata).userAgent, 512) || null,
          metadata: baseMetadata as InputJsonValue,
          createdAt: eventTimestamp ?? receivedAt
        };

        const loadTime = Number(data.loadTime);
        if (Number.isFinite(loadTime)) {
          performanceRecords.push({
            ...metricBase,
            metricName: "page_load_time",
            metricValue: loadTime
          });
        }

        const fcp = Number(data.fcp);
        if (Number.isFinite(fcp)) {
          performanceRecords.push({
            ...metricBase,
            metricName: "first_contentful_paint",
            metricValue: fcp
          });
        }

        const tti = Number(data.tti);
        if (Number.isFinite(tti)) {
          performanceRecords.push({
            ...metricBase,
            metricName: "time_to_interactive",
            metricValue: tti
          });
        }
      }

      if (eventType.includes("error") || eventType.includes("rejection") || data.errorMessage !== undefined) {
        const metadata = asRecord(data.metadata);
        errorRecords.push({
          userId: identity.userId,
          propertyId: identity.authType === "sdk" ? identity.propertyId : null,
          errorType: eventType,
          errorMessage: truncate(data.errorMessage ?? eventType, 1000),
          errorStack: truncate(metadata.stack, 4000) || null,
          componentName: truncate(data.componentName, 255) || null,
          pageUrl,
          userAgent: truncate(metadata.userAgent, 512) || null,
          severity: severityScore >= 8 ? "high" : severityScore >= 5 ? "medium" : "low",
          metadata: baseMetadata as InputJsonValue,
          createdAt: eventTimestamp ?? receivedAt
        });
      }
    }

    const shouldUseSkipDuplicates = env.NODE_ENV === "test" || !env.DATABASE_URL.startsWith("file:");
    const frictionCreateArgs = (shouldUseSkipDuplicates
      ? {
          data: frictionRecords,
          skipDuplicates: true
        }
      : {
          data: frictionRecords
        }) as Parameters<typeof prisma.frictionEvent.createMany>[0];

    const [createdFriction] = await Promise.all([
      prisma.frictionEvent.createMany(frictionCreateArgs),
      performanceRecords.length > 0
        ? prisma.performanceMetric.createMany({
            data: performanceRecords
          })
        : Promise.resolve({ count: 0 }),
      errorRecords.length > 0
        ? prisma.errorLog.createMany({
            data: errorRecords
          })
        : Promise.resolve({ count: 0 })
    ]);

    if (identity.authType === "sdk" && identity.propertyId) {
      try {
        await prisma.analyticsProperty.updateMany({
          where: { id: identity.propertyId },
          data: { lastSeenAt: new Date() }
        });
      } catch (error) {
        request.log.warn({ err: error, propertyId: identity.propertyId }, "Failed to update property activity");
      }
    }

    return reply.code(202).send({
      ok: true,
      received: frictionRecords.length,
      accepted: createdFriction.count,
      duplicates: Math.max(0, frictionRecords.length - createdFriction.count)
    });
  });

  app.post("/api/upload-recording", async (_request, reply) => {
    const request = _request;
    const identity = await resolveIdentity(app, request.headers);
    if (!identity) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const filePart = await request.file();
    if (!filePart) {
      return reply.code(400).send({ message: "Missing file upload" });
    }

    const requestedUserId = String(getFieldValue(filePart.fields as Record<string, unknown>, "userId") ?? "");
    if (isForbiddenJwtUpload(identity, requestedUserId)) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const ownerUserId = identity.userId;

    const sessionId = String(
      getFieldValue(filePart.fields as Record<string, unknown>, "sessionId") ??
        (identity.authType === "sdk" ? identity.sessionId : "unknown-session")
    );
    const metadataRaw = getFieldValue(filePart.fields as Record<string, unknown>, "metadata");
    let metadata: Record<string, unknown> = {};

    if (typeof metadataRaw === "string" && metadataRaw.length > 0) {
      try {
        const parsed = JSON.parse(metadataRaw) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          metadata = parsed as Record<string, unknown>;
        }
      } catch {
        // ignore malformed metadata and proceed with empty object
      }
    }

    const retentionExpiresAt = new Date(
      Date.now() + env.SESSION_RECORDING_RETENTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const buffer = await filePart.toBuffer();
    const extension = filePart.filename.includes(".")
      ? filePart.filename.slice(filePart.filename.lastIndexOf("."))
      : ".json";
    const storagePath = `recordings/${ownerUserId}/${sessionId}/${Date.now()}${extension}`;

    await uploadObject({
      key: storagePath,
      body: buffer,
      contentType: filePart.mimetype || "application/octet-stream"
    });

    await prisma.sessionRecording.create({
      data: {
        sessionId,
        propertyId: identity.authType === "sdk" ? identity.propertyId : null,
        storagePath,
        durationSeconds: Number(metadata.durationSeconds ?? 0),
        fileSizeBytes: BigInt(buffer.byteLength),
        recordingStart: new Date(typeof metadata.recordingStart === "string" ? metadata.recordingStart : Date.now()),
        recordingEnd:
          typeof metadata.recordingEnd === "string"
            ? new Date(metadata.recordingEnd)
            : undefined,
        frictionEventsCount: Number(metadata.frictionEventsCount ?? 0),
        metadata: {
          ...metadata,
          userId: ownerUserId,
          retentionDays: env.SESSION_RECORDING_RETENTION_DAYS,
          retentionExpiresAt,
          ingestAuthType: identity.authType,
          ...(identity.authType === "sdk"
            ? { ingestApiKeyId: identity.apiKeyId, ingestPropertyId: identity.propertyId }
            : {}),
          originalFilename: filePart.filename,
          contentType: filePart.mimetype || "application/octet-stream"
        } as InputJsonValue
      }
    });

    return reply.code(201).send({
      ok: true,
      recordingUrl: `/recordings/${encodeURIComponent(storagePath)}`
    });
  });

  app.post("/api/upload-screenshot", async (request, reply) => {
    const identity = await resolveIdentity(app, request.headers);
    if (!identity) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const filePart = await request.file();
    if (!filePart) {
      return reply.code(400).send({ message: "Missing file upload" });
    }

    const requestedUserId = String(getFieldValue(filePart.fields as Record<string, unknown>, "userId") ?? "");
    if (isForbiddenJwtUpload(identity, requestedUserId)) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const ownerUserId = identity.userId;

    const eventId = String(
      getFieldValue(filePart.fields as Record<string, unknown>, "eventId") ?? "unknown-event"
    );
    const buffer = await filePart.toBuffer();
    const extension = filePart.filename.includes(".")
      ? filePart.filename.slice(filePart.filename.lastIndexOf("."))
      : ".png";
    const storagePath = `screenshots/${ownerUserId}/${eventId}/${Date.now()}${extension}`;

    await uploadObject({
      key: storagePath,
      body: buffer,
      contentType: filePart.mimetype || "application/octet-stream"
    });

    return reply.code(201).send({
      ok: true,
      screenshotUrl: `/screenshots/${encodeURIComponent(storagePath)}`
    });
  });
};
