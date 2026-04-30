import assert from "node:assert/strict";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4000";
const appBaseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:8080";

const readJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  assert.ok(response.ok, `${init?.method ?? "GET"} ${url} returned ${response.status}`);
  return response.json() as Promise<T>;
};

const waitForRealtimeConnection = async (): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const wsUrl = apiBaseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
    const socket = new WebSocket(`${wsUrl}/ws/realtime-dashboard`);
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error("Realtime websocket smoke timed out"));
    }, 7000);

    socket.onmessage = (event) => {
      const payload = JSON.parse(String(event.data)) as { type?: string };
      if (payload.type === "connection") {
        clearTimeout(timeout);
        socket.close();
        resolve();
      }
    };

    socket.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Realtime websocket smoke failed"));
    };
  });
};

const main = async (): Promise<void> => {
  const appResponse = await fetch(appBaseUrl);
  assert.equal(appResponse.status, 200, "Frontend should serve the app shell");

  const deps = await readJson<{ checks: { database: string } }>(`${apiBaseUrl}/health/deps`);
  assert.equal(deps.checks.database, "up", "Database health should be up");

  const sessionId = `smoke-${Date.now()}`;
  const ingest = await readJson<{ ok: boolean; accepted: number }>(`${apiBaseUrl}/api/ingest-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      events: [{
        type: "smoke_click",
        sessionId,
        timestamp: Date.now(),
        eventId: crypto.randomUUID(),
        data: {
          eventType: "smoke_click",
          pageUrl: "/local-smoke",
          elementSelector: "#smoke-action",
          interactionType: "click",
          severityScore: 7
        }
      }]
    })
  });
  assert.equal(ingest.accepted, 1, "Ingest should accept one event");

  const recording = new Blob([
    JSON.stringify([
      {
        type: "snapshot",
        timestamp: 0,
        html: "<!doctype html><html><body><button id=\"smoke-action\">Smoke</button></body></html>"
      },
      {
        type: "click",
        timestamp: 500,
        x: 120,
        y: 80
      }
    ])
  ], { type: "application/json" });
  const form = new FormData();
  form.set("sessionId", sessionId);
  form.set("metadata", JSON.stringify({
    durationSeconds: 1,
    recordingStart: new Date().toISOString(),
    frictionEventsCount: 1
  }));
  form.set("file", recording, "smoke-recording.json");

  const upload = await readJson<{ ok: boolean; recordingUrl: string }>(`${apiBaseUrl}/api/upload-recording`, {
    method: "POST",
    body: form
  });
  assert.equal(upload.ok, true, "Recording upload should succeed");

  const summary = await readJson<{
    summary: { events: number };
    journeys: unknown[];
    alerts: unknown[];
    cohorts: unknown[];
    predictions: unknown[];
  }>(`${apiBaseUrl}/analytics/summary?days=1`);
  assert.ok(summary.summary.events >= 1, "Summary should include smoke events");
  assert.ok(summary.journeys.length >= 1, "Summary should include live journeys");
  assert.ok(summary.alerts.length >= 1, "Summary should include live alerts");
  assert.ok(summary.cohorts.length >= 1, "Summary should include live cohorts");

  const recordings = await readJson<unknown[]>(`${apiBaseUrl}/recordings`);
  assert.ok(recordings.length >= 1, "Recordings list should include uploaded recording");

  await waitForRealtimeConnection();

  console.log("Local smoke passed");
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
