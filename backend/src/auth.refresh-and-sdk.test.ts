import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import bcrypt from "bcryptjs";
import { S3Client } from "@aws-sdk/client-s3";
import { prisma } from "./lib/prisma.js";

const ensureTestEnv = (): void => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
  process.env.PORT = process.env.PORT ?? "4000";
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/nudgr";
  process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:8080";
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "test_access_secret_123456";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test_refresh_secret_123456";
  process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? "15m";
  process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? "30d";
  process.env.S3_ENDPOINT = process.env.S3_ENDPOINT ?? "https://example.com";
  process.env.S3_REGION = process.env.S3_REGION ?? "auto";
  process.env.S3_BUCKET = process.env.S3_BUCKET ?? "nudgr-assets";
  process.env.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ?? "test-key";
  process.env.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY ?? "test-secret";
};

const withApp = async (
  callback: (app: Awaited<ReturnType<(typeof import("./app.js"))["buildApp"]>>) => Promise<void>
): Promise<void> => {
  ensureTestEnv();
  const { buildApp } = await import("./app.js");
  const app = buildApp();

  await app.ready();
  try {
    await callback(app);
  } finally {
    await app.close();
  }
};

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const buildMultipartBody = (params: {
  fields: Record<string, string>;
  file: {
    fieldName: string;
    filename: string;
    contentType: string;
    content: Buffer;
  };
}): { body: Buffer; boundary: string } => {
  const boundary = `----nudgr-test-boundary-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const chunks: Buffer[] = [];

  for (const [name, value] of Object.entries(params.fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="${name}"\r\n\r\n`));
    chunks.push(Buffer.from(`${value}\r\n`));
  }

  chunks.push(Buffer.from(`--${boundary}\r\n`));
  chunks.push(
    Buffer.from(
      `Content-Disposition: form-data; name="${params.file.fieldName}"; filename="${params.file.filename}"\r\n`
    )
  );
  chunks.push(Buffer.from(`Content-Type: ${params.file.contentType}\r\n\r\n`));
  chunks.push(params.file.content);
  chunks.push(Buffer.from("\r\n"));
  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return { body: Buffer.concat(chunks), boundary };
};

test("refresh token rotates and old token is rejected", async () => {
  const userId = "user-refresh-1";
  const passwordHash = await bcrypt.hash("password123", 4);
  const refreshStore = new Map<string, { id: string; userId: string; eventProperties: Record<string, unknown> }>();

  const userDelegate = prisma.user as unknown as { findUnique: (...args: unknown[]) => Promise<unknown> };
  const analyticsDelegate = prisma.analyticsEvent as unknown as {
    create: (...args: unknown[]) => Promise<unknown>;
    findFirst: (...args: unknown[]) => Promise<unknown>;
    update: (...args: unknown[]) => Promise<unknown>;
  };

  const originalUserFindUnique = userDelegate.findUnique;
  const originalAnalyticsCreate = analyticsDelegate.create;
  const originalAnalyticsFindFirst = analyticsDelegate.findFirst;
  const originalAnalyticsUpdate = analyticsDelegate.update;

  userDelegate.findUnique = async (args: unknown) => {
    const typed = args as { where?: { email?: string; id?: string } };
    if (typed.where?.email === "test@example.com") {
      return {
        id: userId,
        email: "test@example.com",
        fullName: "Test User",
        passwordHash
      };
    }

    if (typed.where?.id === userId) {
      return {
        id: userId,
        email: "test@example.com",
        fullName: "Test User"
      };
    }

    return null;
  };

  analyticsDelegate.create = async (args: unknown) => {
    const typed = args as {
      data?: { userId?: string; eventProperties?: Record<string, unknown> };
    };
    const id = `evt-${refreshStore.size + 1}`;
    refreshStore.set(id, {
      id,
      userId: typed.data?.userId ?? userId,
      eventProperties: typed.data?.eventProperties ?? {}
    });
    return { id };
  };

  analyticsDelegate.findFirst = async (args: unknown) => {
    const typed = args as {
      where?: { userId?: string; eventProperties?: { equals?: string } };
    };
    const tokenHash = typed.where?.eventProperties?.equals;
    if (!tokenHash) {
      return null;
    }

    for (const value of refreshStore.values()) {
      if (value.userId === typed.where?.userId && value.eventProperties.tokenHash === tokenHash) {
        return {
          id: value.id,
          eventProperties: value.eventProperties
        };
      }
    }

    return null;
  };

  analyticsDelegate.update = async (args: unknown) => {
    const typed = args as {
      where?: { id?: string };
      data?: { eventProperties?: Record<string, unknown> };
    };
    const id = typed.where?.id;
    if (!id) {
      throw new Error("missing id");
    }

    const existing = refreshStore.get(id);
    if (!existing) {
      throw new Error("missing event");
    }

    existing.eventProperties = typed.data?.eventProperties ?? existing.eventProperties;
    refreshStore.set(id, existing);
    return { id };
  };

  try {
    await withApp(async (app) => {
      const login = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "test@example.com",
          password: "password123"
        }
      });

      assert.equal(login.statusCode, 200);
      const loginBody = login.json() as { refreshToken: string };
      assert.ok(loginBody.refreshToken);
      assert.equal(refreshStore.size, 1);
      const firstTokenHash = hashToken(loginBody.refreshToken);

      const firstRefresh = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: loginBody.refreshToken
        }
      });

      assert.equal(firstRefresh.statusCode, 200);
      const firstRefreshBody = firstRefresh.json() as { refreshToken: string };
      assert.ok(firstRefreshBody.refreshToken);
      assert.notEqual(firstRefreshBody.refreshToken, loginBody.refreshToken);
      assert.equal(refreshStore.size, 2);

      const replay = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: loginBody.refreshToken
        }
      });

      assert.equal(replay.statusCode, 401);

      const originalTokenRecord = [...refreshStore.values()].find((entry) => entry.eventProperties.tokenHash === firstTokenHash);
      assert.ok(originalTokenRecord);
      assert.equal(originalTokenRecord.eventProperties.revoked, true);
      assert.equal(originalTokenRecord.eventProperties.revokedReason, "rotation");
      assert.equal(originalTokenRecord.eventProperties.reuseDetected, true);
      assert.equal(originalTokenRecord.eventProperties.reuseReason, "replay_after_revocation");
      assert.equal(typeof originalTokenRecord.eventProperties.expiresAt, "string");
    });
  } finally {
    userDelegate.findUnique = originalUserFindUnique;
    analyticsDelegate.create = originalAnalyticsCreate;
    analyticsDelegate.findFirst = originalAnalyticsFindFirst;
    analyticsDelegate.update = originalAnalyticsUpdate;
  }
});

test("expired persisted refresh token is rejected and marked expired", async () => {
  const userId = "user-refresh-expired";
  const passwordHash = await bcrypt.hash("password123", 4);
  const refreshStore = new Map<string, { id: string; userId: string; eventProperties: Record<string, unknown> }>();

  const userDelegate = prisma.user as unknown as { findUnique: (...args: unknown[]) => Promise<unknown> };
  const analyticsDelegate = prisma.analyticsEvent as unknown as {
    create: (...args: unknown[]) => Promise<unknown>;
    findFirst: (...args: unknown[]) => Promise<unknown>;
    update: (...args: unknown[]) => Promise<unknown>;
  };

  const originalUserFindUnique = userDelegate.findUnique;
  const originalAnalyticsCreate = analyticsDelegate.create;
  const originalAnalyticsFindFirst = analyticsDelegate.findFirst;
  const originalAnalyticsUpdate = analyticsDelegate.update;

  userDelegate.findUnique = async (args: unknown) => {
    const typed = args as { where?: { email?: string; id?: string } };
    if (typed.where?.email === "expired@example.com") {
      return {
        id: userId,
        email: "expired@example.com",
        fullName: "Expired User",
        passwordHash
      };
    }

    if (typed.where?.id === userId) {
      return {
        id: userId,
        email: "expired@example.com",
        fullName: "Expired User"
      };
    }

    return null;
  };

  analyticsDelegate.create = async (args: unknown) => {
    const typed = args as {
      data?: { userId?: string; eventProperties?: Record<string, unknown> };
    };
    const id = `evt-${refreshStore.size + 1}`;
    refreshStore.set(id, {
      id,
      userId: typed.data?.userId ?? userId,
      eventProperties: typed.data?.eventProperties ?? {}
    });
    return { id };
  };

  analyticsDelegate.findFirst = async (args: unknown) => {
    const typed = args as {
      where?: { userId?: string; eventProperties?: { equals?: string } };
    };
    const tokenHash = typed.where?.eventProperties?.equals;
    if (!tokenHash) {
      return null;
    }

    for (const value of refreshStore.values()) {
      if (value.userId === typed.where?.userId && value.eventProperties.tokenHash === tokenHash) {
        return {
          id: value.id,
          eventProperties: value.eventProperties
        };
      }
    }

    return null;
  };

  analyticsDelegate.update = async (args: unknown) => {
    const typed = args as {
      where?: { id?: string };
      data?: { eventProperties?: Record<string, unknown> };
    };
    const id = typed.where?.id;
    if (!id) {
      throw new Error("missing id");
    }

    const existing = refreshStore.get(id);
    if (!existing) {
      throw new Error("missing event");
    }

    existing.eventProperties = typed.data?.eventProperties ?? existing.eventProperties;
    refreshStore.set(id, existing);
    return { id };
  };

  try {
    await withApp(async (app) => {
      const login = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "expired@example.com",
          password: "password123"
        }
      });

      assert.equal(login.statusCode, 200);
      const loginBody = login.json() as { refreshToken: string };
      const tokenHash = hashToken(loginBody.refreshToken);

      const stored = [...refreshStore.values()].find((entry) => entry.eventProperties.tokenHash === tokenHash);
      assert.ok(stored);
      stored.eventProperties = {
        ...stored.eventProperties,
        expiresAt: new Date(Date.now() - 60_000).toISOString()
      };

      const refresh = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: loginBody.refreshToken
        }
      });

      assert.equal(refresh.statusCode, 401);
      assert.equal(stored.eventProperties.revoked, true);
      assert.equal(stored.eventProperties.revokedReason, "expired");
    });
  } finally {
    userDelegate.findUnique = originalUserFindUnique;
    analyticsDelegate.create = originalAnalyticsCreate;
    analyticsDelegate.findFirst = originalAnalyticsFindFirst;
    analyticsDelegate.update = originalAnalyticsUpdate;
  }
});

test("logout revokes refresh token", async () => {
  const userId = "user-refresh-logout";
  const passwordHash = await bcrypt.hash("password123", 4);
  const refreshStore = new Map<string, { id: string; userId: string; eventProperties: Record<string, unknown> }>();

  const userDelegate = prisma.user as unknown as { findUnique: (...args: unknown[]) => Promise<unknown> };
  const analyticsDelegate = prisma.analyticsEvent as unknown as {
    create: (...args: unknown[]) => Promise<unknown>;
    findFirst: (...args: unknown[]) => Promise<unknown>;
    update: (...args: unknown[]) => Promise<unknown>;
  };

  const originalUserFindUnique = userDelegate.findUnique;
  const originalAnalyticsCreate = analyticsDelegate.create;
  const originalAnalyticsFindFirst = analyticsDelegate.findFirst;
  const originalAnalyticsUpdate = analyticsDelegate.update;

  userDelegate.findUnique = async (args: unknown) => {
    const typed = args as { where?: { email?: string; id?: string } };
    if (typed.where?.email === "logout@example.com") {
      return {
        id: userId,
        email: "logout@example.com",
        fullName: "Logout User",
        passwordHash
      };
    }

    if (typed.where?.id === userId) {
      return {
        id: userId,
        email: "logout@example.com",
        fullName: "Logout User"
      };
    }

    return null;
  };

  analyticsDelegate.create = async (args: unknown) => {
    const typed = args as {
      data?: { userId?: string; eventProperties?: Record<string, unknown> };
    };
    const id = `evt-${refreshStore.size + 1}`;
    refreshStore.set(id, {
      id,
      userId: typed.data?.userId ?? userId,
      eventProperties: typed.data?.eventProperties ?? {}
    });
    return { id };
  };

  analyticsDelegate.findFirst = async (args: unknown) => {
    const typed = args as {
      where?: { userId?: string; eventProperties?: { equals?: string } };
    };
    const tokenHash = typed.where?.eventProperties?.equals;
    if (!tokenHash) {
      return null;
    }

    for (const value of refreshStore.values()) {
      if (value.userId === typed.where?.userId && value.eventProperties.tokenHash === tokenHash) {
        return {
          id: value.id,
          eventProperties: value.eventProperties
        };
      }
    }

    return null;
  };

  analyticsDelegate.update = async (args: unknown) => {
    const typed = args as {
      where?: { id?: string };
      data?: { eventProperties?: Record<string, unknown> };
    };
    const id = typed.where?.id;
    if (!id) {
      throw new Error("missing id");
    }

    const existing = refreshStore.get(id);
    if (!existing) {
      throw new Error("missing event");
    }

    existing.eventProperties = typed.data?.eventProperties ?? existing.eventProperties;
    refreshStore.set(id, existing);
    return { id };
  };

  try {
    await withApp(async (app) => {
      const login = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "logout@example.com",
          password: "password123"
        }
      });

      assert.equal(login.statusCode, 200);
      const loginBody = login.json() as { refreshToken: string };

      const logout = await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: {
          refreshToken: loginBody.refreshToken
        }
      });

      assert.equal(logout.statusCode, 200);

      const replay = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: loginBody.refreshToken
        }
      });

      assert.equal(replay.statusCode, 401);
    });
  } finally {
    userDelegate.findUnique = originalUserFindUnique;
    analyticsDelegate.create = originalAnalyticsCreate;
    analyticsDelegate.findFirst = originalAnalyticsFindFirst;
    analyticsDelegate.update = originalAnalyticsUpdate;
  }
});

test("SDK session auth allows ingest and upload routes to pass auth layer", async () => {
  const plainApiKey = "sdk_live_test_key";
  const userId = "sdk-user-1";
  const expectedKeyHash = hashToken(plainApiKey);

  const apiKeyDelegate = prisma.apiKey as unknown as {
    findFirst: (...args: unknown[]) => Promise<unknown>;
  };
  const frictionEventDelegate = prisma.frictionEvent as unknown as {
    createMany: (...args: unknown[]) => Promise<unknown>;
  };

  const originalApiKeyFindFirst = apiKeyDelegate.findFirst;
  const originalFrictionCreateMany = frictionEventDelegate.createMany;

  apiKeyDelegate.findFirst = async (args: unknown) => {
    const typed = args as {
      where?: { keyHash?: string; isActive?: boolean };
    };

    if (typed.where?.isActive && typed.where.keyHash === expectedKeyHash) {
      return {
        id: "api-key-1",
        userId,
        allowedDomains: ["app.example.com"]
      };
    }

    return null;
  };

  frictionEventDelegate.createMany = async (args: unknown) => {
    const typed = args as { data?: unknown[] };
    return {
      count: typed.data?.length ?? 0
    };
  };

  try {
    await withApp(async (app) => {
      const session = await app.inject({
        method: "POST",
        url: "/api/sdk/session",
        headers: {
          "x-api-key": plainApiKey,
          origin: "https://app.example.com"
        },
        payload: {
          sessionId: "sdk-session-123",
          siteUserId: "external-user-1",
          pageUrl: "https://app.example.com/pricing",
          userAgent: "unit-test"
        }
      });

      assert.equal(session.statusCode, 201);
      const sessionBody = session.json() as { sdkSessionToken: string };
      assert.ok(sessionBody.sdkSessionToken);

      const ingest = await app.inject({
        method: "POST",
        url: "/api/ingest-events",
        headers: {
          "x-api-key": plainApiKey,
          "x-sdk-session-token": sessionBody.sdkSessionToken
        },
        payload: {
          events: [
            {
              type: "friction",
              sessionId: "sdk-session-123",
              data: {
                eventType: "rage_click",
                pageUrl: "https://app.example.com/pricing",
                severityScore: 8
              }
            }
          ]
        }
      });

      assert.equal(ingest.statusCode, 202);

      const recording = await app.inject({
        method: "POST",
        url: "/api/upload-recording",
        headers: {
          "x-api-key": plainApiKey,
          "x-sdk-session-token": sessionBody.sdkSessionToken
        }
      });

      assert.equal(recording.statusCode, 406);

      const screenshot = await app.inject({
        method: "POST",
        url: "/api/upload-screenshot",
        headers: {
          "x-api-key": plainApiKey,
          "x-sdk-session-token": sessionBody.sdkSessionToken
        }
      });

      assert.equal(screenshot.statusCode, 406);
    });
  } finally {
    apiKeyDelegate.findFirst = originalApiKeyFindFirst;
    frictionEventDelegate.createMany = originalFrictionCreateMany;
  }
});

test("SDK session auth allows successful multipart recording and screenshot uploads", async () => {
  const plainApiKey = "sdk_live_upload_key";
  const userId = "sdk-user-upload";
  const expectedKeyHash = hashToken(plainApiKey);
  const uploadedKeys: string[] = [];
  const createdRecordings: unknown[] = [];

  const apiKeyDelegate = prisma.apiKey as unknown as {
    findFirst: (...args: unknown[]) => Promise<unknown>;
  };
  const sessionRecordingDelegate = prisma.sessionRecording as unknown as {
    create: (...args: unknown[]) => Promise<unknown>;
  };

  const originalApiKeyFindFirst = apiKeyDelegate.findFirst;
  const originalSessionRecordingCreate = sessionRecordingDelegate.create;
  const originalS3Send = S3Client.prototype.send;

  apiKeyDelegate.findFirst = async (args: unknown) => {
    const typed = args as {
      where?: { keyHash?: string; isActive?: boolean };
    };

    if (typed.where?.isActive && typed.where.keyHash === expectedKeyHash) {
      return {
        id: "api-key-upload-1",
        userId,
        allowedDomains: ["app.example.com"]
      };
    }

    return null;
  };

  sessionRecordingDelegate.create = async (args: unknown) => {
    createdRecordings.push(args);
    return { id: "recording-1" };
  };

  S3Client.prototype.send = async (command: unknown) => {
    const typed = command as { input?: { Key?: string } };
    if (typed.input?.Key) {
      uploadedKeys.push(String(typed.input.Key));
    }
    return {} as never;
  };

  try {
    await withApp(async (app) => {
      const session = await app.inject({
        method: "POST",
        url: "/api/sdk/session",
        headers: {
          "x-api-key": plainApiKey,
          origin: "https://app.example.com"
        },
        payload: {
          sessionId: "sdk-session-upload-1",
          siteUserId: "external-user-upload",
          pageUrl: "https://app.example.com/settings",
          userAgent: "unit-test"
        }
      });

      assert.equal(session.statusCode, 201);
      const sessionBody = session.json() as { sdkSessionToken: string };

      const recordingPayload = buildMultipartBody({
        fields: {
          sessionId: "sdk-session-upload-1",
          metadata: JSON.stringify({ durationSeconds: 12, frictionEventsCount: 2 })
        },
        file: {
          fieldName: "file",
          filename: "recording.json",
          contentType: "application/json",
          content: Buffer.from("{\"events\":[{\"t\":1}]}", "utf8")
        }
      });

      const recording = await app.inject({
        method: "POST",
        url: "/api/upload-recording",
        headers: {
          "x-api-key": plainApiKey,
          "x-sdk-session-token": sessionBody.sdkSessionToken,
          "content-type": `multipart/form-data; boundary=${recordingPayload.boundary}`
        },
        payload: recordingPayload.body
      });

      assert.equal(recording.statusCode, 201);

      const screenshotPayload = buildMultipartBody({
        fields: {
          eventId: "evt-123"
        },
        file: {
          fieldName: "file",
          filename: "shot.png",
          contentType: "image/png",
          content: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        }
      });

      const screenshot = await app.inject({
        method: "POST",
        url: "/api/upload-screenshot",
        headers: {
          "x-api-key": plainApiKey,
          "x-sdk-session-token": sessionBody.sdkSessionToken,
          "content-type": `multipart/form-data; boundary=${screenshotPayload.boundary}`
        },
        payload: screenshotPayload.body
      });

      assert.equal(screenshot.statusCode, 201);
      assert.equal(createdRecordings.length, 1);
      assert.equal(uploadedKeys.length, 2);
      assert.ok(uploadedKeys.some((key) => key.startsWith("recordings/")));
      assert.ok(uploadedKeys.some((key) => key.startsWith("screenshots/")));
    });
  } finally {
    apiKeyDelegate.findFirst = originalApiKeyFindFirst;
    sessionRecordingDelegate.create = originalSessionRecordingCreate;
    S3Client.prototype.send = originalS3Send;
  }
});

test("token hygiene summary returns auth token metrics", async () => {
  const userId = "token-summary-user";
  const analyticsDelegate = prisma.analyticsEvent as unknown as {
    findMany: (...args: unknown[]) => Promise<unknown>;
    count: (...args: unknown[]) => Promise<unknown>;
  };

  const originalAnalyticsFindMany = analyticsDelegate.findMany;
  const originalAnalyticsCount = analyticsDelegate.count;

  analyticsDelegate.findMany = async () => {
    const now = Date.now();
    return [
      {
        createdAt: new Date(now - 10_000),
        eventProperties: {
          revoked: false,
          expiresAt: new Date(now + 86_400_000).toISOString()
        }
      },
      {
        createdAt: new Date(now - 20_000),
        eventProperties: {
          revoked: true,
          revokedReason: "rotation",
          replacedByTokenId: "replacement-token",
          expiresAt: new Date(now + 86_400_000).toISOString()
        }
      },
      {
        createdAt: new Date(now - 30_000),
        eventProperties: {
          revoked: true,
          revokedReason: "logout",
          reuseDetected: true,
          expiresAt: new Date(now - 1_000).toISOString()
        }
      }
    ];
  };

  analyticsDelegate.count = async () => 2;

  try {
    await withApp(async (app) => {
      const accessToken = await Promise.resolve(app.jwt.sign({ sub: userId, email: "summary@example.com" }));
      const summary = await app.inject({
        method: "GET",
        url: "/auth/token-hygiene-summary",
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      });

      assert.equal(summary.statusCode, 200);
      const body = summary.json() as {
        summary: {
          issuedTokens: number;
          activeTokens: number;
          revokedTokens: number;
          rotatedTokens: number;
          expiredTokens: number;
          logoutRevocations: number;
          reuseDetections: number;
        };
      };

      assert.equal(body.summary.issuedTokens, 3);
      assert.equal(body.summary.activeTokens, 1);
      assert.equal(body.summary.revokedTokens, 2);
      assert.equal(body.summary.rotatedTokens, 1);
      assert.equal(body.summary.expiredTokens, 1);
      assert.equal(body.summary.logoutRevocations, 1);
      assert.equal(body.summary.reuseDetections, 3);
    });
  } finally {
    analyticsDelegate.findMany = originalAnalyticsFindMany;
    analyticsDelegate.count = originalAnalyticsCount;
  }
});
