import assert from "node:assert/strict";
import test from "node:test";

const ensureTestEnv = (): void => {
  process.env.NODE_ENV = "test";
  process.env.PORT = process.env.PORT ?? "4000";
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./test.db";
  process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:8080";
  process.env.DISABLE_AUTH = "false";
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "test_access_secret_123456";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test_refresh_secret_123456";
  process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? "15m";
  process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? "30d";
  process.env.S3_ENDPOINT = process.env.S3_ENDPOINT ?? "https://example.com";
  process.env.S3_REGION = process.env.S3_REGION ?? "auto";
  process.env.S3_BUCKET = process.env.S3_BUCKET ?? "nudgr-assets";
  process.env.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ?? "test-key";
  process.env.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY ?? "test-secret";
  process.env.GOOGLE_OAUTH_CLIENT_ID = "";
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = "";
  process.env.GOOGLE_OAUTH_REDIRECT_URI = "";
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

test("POST /api/upload-recording requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/upload-recording"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("POST /api/ingest-events requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/ingest-events",
      payload: {
        events: [
          {
            type: "friction",
            data: {
              eventType: "rage_click",
              pageUrl: "https://example.com"
            }
          }
        ]
      }
    });

    assert.equal(response.statusCode, 401);
  });
});

test("POST /api/sdk/session requires API key", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/sdk/session",
      payload: {
        sessionId: "sdk-session-1"
      }
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /auth/google reports missing provider config", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/auth/google"
    });

    assert.equal(response.statusCode, 503);
  });
});

test("POST /ai/analyze requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/ai/analyze",
      payload: {
        analysisType: "general"
      }
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /ab-tests/:id/bayesian-summary requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/ab-tests/00000000-0000-0000-0000-000000000000/bayesian-summary"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("POST /marketing/import-events requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/marketing/import-events",
      payload: {
        provider: "ga4",
        events: [
          {
            externalEventId: "evt_1"
          }
        ]
      }
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /marketing/import-summary requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/marketing/import-summary"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /analytics/summary requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/analytics/summary"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /properties requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/properties"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /collection/observability requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/collection/observability"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("POST /event-definitions requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/event-definitions",
      payload: {
        eventName: "signup_started"
      }
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /security/posture requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/security/posture"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /recordings/* requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/recordings/recordings%2Fuser-1%2Fsession%2Fabc.json"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /exports/* requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/exports/exports%2Fuser-1%2Freport.pdf"
    });

    assert.equal(response.statusCode, 401);
  });
});

test("GET /screenshots/* requires auth", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "GET",
      url: "/screenshots/screenshots%2Fuser-1%2Fevt%2Fshot.png"
    });

    assert.equal(response.statusCode, 401);
  });
});
