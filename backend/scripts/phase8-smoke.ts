import "dotenv/config";
import type { HTTPMethods, InjectOptions } from "fastify";

const baseUrl = process.env.SMOKE_BASE_URL?.replace(/\/$/, "");

interface SmokeResult {
  name: string;
  ok: boolean;
  details: string;
}

const parseResponseBody = (text: string): unknown => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const toInjectMethod = (method: string | undefined): HTTPMethods => {
  const normalized = (method ?? "GET").toUpperCase();
  const allowedMethods: HTTPMethods[] = [
    "DELETE",
    "GET",
    "HEAD",
    "PATCH",
    "POST",
    "PUT",
    "OPTIONS"
  ];

  return allowedMethods.includes(normalized as HTTPMethods)
    ? (normalized as HTTPMethods)
    : "GET";
};

const run = async (): Promise<void> => {
  const results: SmokeResult[] = [];

  const requestJson = async (path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: unknown }> => {
    if (baseUrl) {
      const response = await fetch(`${baseUrl}${path}`, init);
      const text = await response.text();

      return {
        ok: response.ok,
        status: response.status,
        body: parseResponseBody(text)
      };
    }

    const { buildApp } = await import("../src/app.js");
    const app = buildApp();
    await app.ready();

    try {
      const injectOptions: InjectOptions = {
        method: toInjectMethod(init?.method),
        url: path
      };
      const response = await app.inject(injectOptions);

      return {
        ok: response.statusCode >= 200 && response.statusCode < 300,
        status: response.statusCode,
        body: parseResponseBody(response.body)
      };
    } finally {
      await app.close();
    }
  };

  try {
    const health = await requestJson("/health");
    const healthBody = health.body as { ok?: boolean } | null;
    results.push({
      name: "health endpoint",
      ok: health.status === 200 && Boolean(healthBody?.ok),
      details: `status=${health.status}`
    });

    const deps = await requestJson("/health/deps");
    const depsBody = deps.body as { ok?: boolean; checks?: { database?: string } } | null;
    results.push({
      name: "dependency health endpoint",
      ok: deps.status === 200 && Boolean(depsBody?.ok) && depsBody?.checks?.database === "up",
      details: `status=${deps.status}`
    });

    const metricsUnauthorized = await requestJson("/metrics/recent");
    results.push({
      name: "auth guard /metrics/recent",
      ok: metricsUnauthorized.status === 401,
      details: `status=${metricsUnauthorized.status}`
    });

    const aiUnauthorized = await requestJson("/ai/analyze", {
      method: "POST"
    });
    results.push({
      name: "auth guard /ai/analyze",
      ok: aiUnauthorized.status === 401,
      details: `status=${aiUnauthorized.status}`
    });

    const marketingImportUnauthorized = await requestJson("/marketing/import-events", {
      method: "POST"
    });
    results.push({
      name: "auth guard /marketing/import-events",
      ok: marketingImportUnauthorized.status === 401,
      details: `status=${marketingImportUnauthorized.status}`
    });

    const marketingSummaryUnauthorized = await requestJson("/marketing/import-summary");
    results.push({
      name: "auth guard /marketing/import-summary",
      ok: marketingSummaryUnauthorized.status === 401,
      details: `status=${marketingSummaryUnauthorized.status}`
    });

    const tokenHygieneSummaryUnauthorized = await requestJson("/auth/token-hygiene-summary");
    results.push({
      name: "auth guard /auth/token-hygiene-summary",
      ok: tokenHygieneSummaryUnauthorized.status === 401,
      details: `status=${tokenHygieneSummaryUnauthorized.status}`
    });

    const uploadUnauthorized = await requestJson("/api/upload-recording", { method: "POST" });
    results.push({
      name: "auth guard /api/upload-recording",
      ok: uploadUnauthorized.status === 401,
      details: `status=${uploadUnauthorized.status}`
    });

    const wsBase = (baseUrl || "http://127.0.0.1:4000").replace(/^http/i, "ws");
    const wsUrl = `${wsBase}/ws/realtime-dashboard?token=<jwt>`;
    results.push({
      name: "realtime endpoint url",
      ok: wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://"),
      details: wsUrl
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    results.push({
      name: "smoke execution",
      ok: false,
      details: message
    });
  }

  const failures = results.filter((result) => !result.ok);

  console.log("\nPhase 8 Smoke Report");
  console.log("====================");
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${result.details})`);
  }

  if (failures.length > 0) {
    console.error(`\nSmoke checks failed with ${failures.length} issue(s).`);
    process.exit(1);
  }

  console.log("\nSmoke checks passed.");
};

void run();
