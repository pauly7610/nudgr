import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(180).default(30),
  propertyId: z.string().uuid().optional()
});

const getUserId = (request: { user?: unknown }): string | null => {
  const payload = request.user as { sub?: string } | undefined;
  return payload?.sub ?? null;
};

const toDateBucket = (date: Date): string => date.toISOString().slice(0, 10);

const getUtcWindowStart = (days: number): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));
};

const asObject = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as Record<string, unknown>;
};

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const stableIdFragment = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "surface";
};

const shortSurfaceName = (value: string): string => {
  if (value === "unknown") {
    return "Unknown Surface";
  }

  try {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}` || parsed.hostname;
  } catch {
    return value;
  }
};

const classifyFrictionType = (
  eventType: string,
  metadata: Record<string, unknown>,
  severityScore: number
): "rage_clicks" | "form_abandonment" | "navigation_loops" | "excessive_scrolling" | null => {
  const signal = `${eventType} ${String(metadata.interactionType ?? "")}`.toLowerCase();

  if (signal.includes("form")) {
    return "form_abandonment";
  }

  if (signal.includes("rage") || signal.includes("click")) {
    return "rage_clicks";
  }

  if (signal.includes("scroll")) {
    return "excessive_scrolling";
  }

  if (signal.includes("navigation") || signal.includes("loop") || signal.includes("route")) {
    return "navigation_loops";
  }

  return severityScore >= 7 ? "rage_clicks" : null;
};

const classifyActionType = (
  eventType: string,
  metadata: Record<string, unknown>
): "click" | "view" | "scroll" | "form_input" | "hover" => {
  const signal = `${eventType} ${String(metadata.interactionType ?? "")}`.toLowerCase();

  if (signal.includes("form") || signal.includes("input")) {
    return "form_input";
  }

  if (signal.includes("scroll")) {
    return "scroll";
  }

  if (signal.includes("hover")) {
    return "hover";
  }

  if (signal.includes("view") || signal.includes("load")) {
    return "view";
  }

  return "click";
};

const describeAction = (eventType: string, metadata: Record<string, unknown>, severityScore: number): string => {
  const element = typeof metadata.elementSelector === "string" ? metadata.elementSelector : null;
  const base = eventType.replace(/_/g, " ");
  const suffix = severityScore >= 7 ? " with high friction" : "";

  return element ? `${base} on ${element}${suffix}` : `${base}${suffix}`;
};

const buildJourneyDetails = (params: {
  pageUrl: string;
  events: Array<{
    eventType: string;
    severityScore: number;
    metadata: unknown;
    createdAt: Date;
  }>;
  impacted: number;
  retained: number;
}) => {
  const actions = params.events
    .slice(-12)
    .map((event) => {
      const metadata = asObject(event.metadata);
      const actionType = classifyActionType(event.eventType, metadata);

      return {
        type: actionType,
        element: String(metadata.elementSelector ?? metadata.target ?? "page"),
        description: describeAction(event.eventType, metadata, event.severityScore),
        timestamp: event.createdAt.toISOString(),
        duration: typeof metadata.durationMs === "number" ? Math.round(metadata.durationMs / 1000) : undefined,
        hoverData: actionType === "hover"
          ? {
              coordinates: `${Number(metadata.x ?? 0)},${Number(metadata.y ?? 0)}`,
              dwellTime: Number(metadata.durationMs ?? 0)
            }
          : undefined
      };
    });

  const baseActions = actions.length > 0
    ? actions
    : [{
        type: "view" as const,
        element: "page",
        description: "No granular actions captured yet",
        timestamp: new Date().toISOString()
      }];

  return [
    {
      page: shortSurfaceName(params.pageUrl),
      url: params.pageUrl,
      actions: baseActions,
      timeSpent: Math.max(1, params.events.length * 8)
    },
    {
      page: params.impacted > 0 ? "Friction review" : "Low-friction path",
      url: params.pageUrl,
      actions: baseActions.filter((action) => action.description.includes("high friction")).length > 0
        ? baseActions.filter((action) => action.description.includes("high friction"))
        : baseActions.slice(0, 3),
      timeSpent: Math.max(1, params.impacted * 12)
    },
    {
      page: params.impacted > 0 ? "Needs attention" : "Healthy continuation",
      url: params.pageUrl,
      actions: baseActions.slice(-3),
      timeSpent: Math.max(1, params.retained * 5)
    }
  ];
};

const buildPredictions = (params: {
  events: number;
  highFrictionEvents: number;
  errors: number;
  averagePageLoadMs: number | null;
  frictionScore: number;
}) => {
  const predictions: Array<{
    type: "friction_increase" | "conversion_drop" | "performance_issue" | "improvement";
    confidence: number;
    description: string;
    impact: "high" | "medium" | "low";
    timeframe: string;
  }> = [];

  if (params.events === 0) {
    return predictions;
  }

  const highFrictionRate = params.highFrictionEvents / params.events;
  const errorRate = params.errors / Math.max(1, params.events);

  if (highFrictionRate >= 0.25) {
    predictions.push({
      type: "friction_increase",
      confidence: clamp(Math.round(65 + highFrictionRate * 30), 65, 95),
      description: "High-friction behavior is concentrated enough to risk near-term abandonment.",
      impact: highFrictionRate >= 0.45 ? "high" : "medium",
      timeframe: "24 hours"
    });
  }

  if (errorRate >= 0.2) {
    predictions.push({
      type: "conversion_drop",
      confidence: clamp(Math.round(60 + errorRate * 35), 60, 94),
      description: "Recent error volume is likely to depress conversion until the affected surfaces are fixed.",
      impact: errorRate >= 0.5 ? "high" : "medium",
      timeframe: "7 days"
    });
  }

  if (params.averagePageLoadMs !== null && params.averagePageLoadMs >= 2500) {
    predictions.push({
      type: "performance_issue",
      confidence: clamp(Math.round(params.averagePageLoadMs / 50), 60, 92),
      description: "Page-load latency is high enough to create measurable engagement risk.",
      impact: params.averagePageLoadMs >= 4000 ? "high" : "medium",
      timeframe: "72 hours"
    });
  }

  if (params.frictionScore >= 80 && predictions.length === 0) {
    predictions.push({
      type: "improvement",
      confidence: 72,
      description: "Current signals suggest the experience is stable, with no major friction spike forming.",
      impact: "low",
      timeframe: "7 days"
    });
  }

  return predictions.slice(0, 5);
};

const buildDateBuckets = (days: number): Map<string, {
  date: string;
  events: number;
  highFrictionEvents: number;
  errors: number;
}> => {
  const buckets = new Map<string, {
    date: string;
    events: number;
    highFrictionEvents: number;
    errors: number;
  }>();
  const start = getUtcWindowStart(days);

  for (let index = 0; index < days; index += 1) {
    const date = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
    const bucket = toDateBucket(date);
    buckets.set(bucket, {
      date: bucket,
      events: 0,
      highFrictionEvents: 0,
      errors: 0
    });
  }

  return buckets;
};

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/analytics/summary", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = analyticsQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid analytics query",
        issues: parseResult.error.flatten()
      });
    }

    const days = parseResult.data.days;
    const propertyId = parseResult.data.propertyId;
    if (propertyId) {
      const property = await prisma.analyticsProperty.findFirst({
        where: { id: propertyId, userId },
        select: {
          id: true,
          name: true,
          domain: true,
          environment: true
        }
      });

      if (!property) {
        return reply.code(404).send({ message: "Property not found" });
      }
    }

    const since = getUtcWindowStart(days);
    const [events, performanceMetrics, errors] = await Promise.all([
      prisma.frictionEvent.findMany({
        where: {
          userId,
          ...(propertyId ? { propertyId } : {}),
          createdAt: { gte: since }
        },
        orderBy: { createdAt: "asc" },
        take: 10_000,
        select: {
          id: true,
          eventType: true,
          pageUrl: true,
          sessionId: true,
          severityScore: true,
          metadata: true,
          createdAt: true
        }
      }),
      prisma.performanceMetric.findMany({
        where: {
          userId,
          ...(propertyId ? { propertyId } : {}),
          createdAt: { gte: since }
        },
        orderBy: { createdAt: "asc" },
        take: 10_000,
        select: {
          metricName: true,
          metricValue: true,
          pageUrl: true,
          createdAt: true
        }
      }),
      prisma.errorLog.findMany({
        where: {
          userId,
          ...(propertyId ? { propertyId } : {}),
          createdAt: { gte: since }
        },
        orderBy: { createdAt: "asc" },
        take: 10_000,
        select: {
          severity: true,
          pageUrl: true,
          createdAt: true
        }
      })
    ]);

    const sessions = new Set<string>();
    const pages = new Set<string>();
    const eventTypes = new Map<string, number>();
    const pageStats = new Map<string, {
      pageUrl: string;
      events: number;
      sessions: Set<string>;
      severityTotal: number;
      highFrictionEvents: number;
      errors: number;
      frictionTypes: Set<"rage_clicks" | "form_abandonment" | "navigation_loops" | "excessive_scrolling">;
      latestEventAt: Date | null;
    }>();
    const eventsByPage = new Map<string, typeof events>();
    const dateBuckets = buildDateBuckets(Math.min(days, 90));
    const sessionPaths = new Map<string, string[]>();
    let pageViews = 0;
    let severityTotal = 0;
    let highFrictionEvents = 0;

    for (const event of events) {
      const metadata = asObject(event.metadata);
      const pageUrl = event.pageUrl || "unknown";
      const sessionId = event.sessionId || "unknown-session";
      const isPageView = event.eventType === "page_view" || metadata.interactionType === "pageview";

      pages.add(pageUrl);
      sessions.add(sessionId);
      const pageEvents = eventsByPage.get(pageUrl) ?? [];
      pageEvents.push(event);
      eventsByPage.set(pageUrl, pageEvents);
      severityTotal += event.severityScore;
      if (event.severityScore >= 7) {
        highFrictionEvents += 1;
      }
      if (isPageView) {
        pageViews += 1;
      }

      eventTypes.set(event.eventType, (eventTypes.get(event.eventType) ?? 0) + 1);

      const currentPageStats = pageStats.get(pageUrl) ?? {
        pageUrl,
        events: 0,
        sessions: new Set<string>(),
        severityTotal: 0,
        highFrictionEvents: 0,
        errors: 0,
        frictionTypes: new Set(),
        latestEventAt: null
      };
      currentPageStats.events += 1;
      currentPageStats.sessions.add(sessionId);
      currentPageStats.severityTotal += event.severityScore;
      if (event.severityScore >= 7) {
        currentPageStats.highFrictionEvents += 1;
      }
      const frictionType = classifyFrictionType(event.eventType, metadata, event.severityScore);
      if (frictionType) {
        currentPageStats.frictionTypes.add(frictionType);
      }
      if (!currentPageStats.latestEventAt || event.createdAt > currentPageStats.latestEventAt) {
        currentPageStats.latestEventAt = event.createdAt;
      }
      pageStats.set(pageUrl, currentPageStats);

      const bucket = dateBuckets.get(toDateBucket(event.createdAt));
      if (bucket) {
        bucket.events += 1;
        if (event.severityScore >= 7) {
          bucket.highFrictionEvents += 1;
        }
      }

      const currentPath = sessionPaths.get(sessionId) ?? [];
      if (currentPath[currentPath.length - 1] !== pageUrl) {
        currentPath.push(pageUrl);
      }
      sessionPaths.set(sessionId, currentPath);
    }

    for (const error of errors) {
      const pageUrl = error.pageUrl || "unknown";
      const currentPageStats = pageStats.get(pageUrl) ?? {
        pageUrl,
        events: 0,
        sessions: new Set<string>(),
        severityTotal: 0,
        highFrictionEvents: 0,
        errors: 0,
        frictionTypes: new Set(),
        latestEventAt: null
      };
      currentPageStats.errors += 1;
      currentPageStats.frictionTypes.add("navigation_loops");
      if (!currentPageStats.latestEventAt || error.createdAt > currentPageStats.latestEventAt) {
        currentPageStats.latestEventAt = error.createdAt;
      }
      pageStats.set(pageUrl, currentPageStats);

      const bucket = dateBuckets.get(toDateBucket(error.createdAt));
      if (bucket) {
        bucket.errors += 1;
      }
    }

    const transitionCounts = new Map<string, {
      from: string;
      to: string;
      sessions: number;
    }>();
    for (const path of sessionPaths.values()) {
      for (let index = 0; index < path.length - 1; index += 1) {
        const from = path[index];
        const to = path[index + 1];
        const key = `${from}\n${to}`;
        const transition = transitionCounts.get(key) ?? { from, to, sessions: 0 };
        transition.sessions += 1;
        transitionCounts.set(key, transition);
      }
    }

    const averageSeverity = events.length > 0 ? severityTotal / events.length : 0;
    const highFrictionRate = events.length > 0 ? highFrictionEvents / events.length : 0;
    const errorRate = events.length > 0 ? errors.length / events.length : 0;
    const frictionScore = clamp(
      Math.round(100 - averageSeverity * 7 - highFrictionRate * 35 - errorRate * 25),
      0,
      100
    );
    const loadMetrics = performanceMetrics.filter((metric) => metric.metricName === "page_load_time");
    const averagePageLoadMs = loadMetrics.length > 0
      ? loadMetrics.reduce((sum, metric) => sum + metric.metricValue, 0) / loadMetrics.length
      : null;
    const rankedPages = [...pageStats.values()]
      .sort((a, b) => {
        const aImpact = a.highFrictionEvents + a.errors;
        const bImpact = b.highFrictionEvents + b.errors;
        return bImpact - aImpact || b.events - a.events;
      });
    const journeys = rankedPages.slice(0, 8).map((page, index) => {
      const baseline = Math.max(page.events, page.sessions.size, 1);
      const impacted = Math.min(baseline, page.highFrictionEvents + page.errors);
      const retained = Math.max(0, baseline - impacted);
      const friction = [...page.frictionTypes];

      return {
        id: `surface-${index + 1}-${stableIdFragment(page.pageUrl)}`,
        flow: shortSurfaceName(page.pageUrl),
        steps: [
          {
            label: "Observed Traffic",
            users: baseline
          },
          {
            label: "Low-Friction Interactions",
            users: retained,
            dropOff: impacted,
            friction: impacted > 0 && friction.length > 0 ? friction : undefined
          },
          {
            label: impacted > 0 ? "Needs Attention" : "Healthy Continuation",
            users: retained,
            dropOff: 0,
            friction: impacted > 0 ? friction : undefined
          }
        ],
        details: buildJourneyDetails({
          pageUrl: page.pageUrl,
          events: eventsByPage.get(page.pageUrl) ?? [],
          impacted,
          retained
        })
      };
    });
    const alerts = rankedPages
      .filter((page) => page.highFrictionEvents > 0 || page.errors > 0)
      .slice(0, 10)
      .map((page, index) => ({
        id: `analytics-alert-${index + 1}-${stableIdFragment(page.pageUrl)}`,
        timestamp: (page.latestEventAt ?? new Date()).toISOString(),
        message: `${page.highFrictionEvents + page.errors} friction signal(s) on ${shortSurfaceName(page.pageUrl)}`,
        type: page.errors > 0 || page.highFrictionEvents >= 3 ? "error" : "warning",
        flowId: `surface-${rankedPages.findIndex((candidate) => candidate.pageUrl === page.pageUrl) + 1}-${stableIdFragment(page.pageUrl)}`,
        stepIndex: 1
      }));
    const cohorts = [
      {
        id: "cohort-all-traffic",
        name: "All Traffic",
        conversionRate: events.length > 0 ? round((pageViews / events.length) * 100, 1) : 0,
        frictionScore,
        change: 0
      },
      {
        id: "cohort-high-friction",
        name: "High-Friction Sessions",
        conversionRate: sessions.size > 0 ? round((highFrictionEvents / sessions.size) * 100, 1) : 0,
        frictionScore: clamp(Math.round(highFrictionRate * 100), 0, 100),
        change: 0
      },
      {
        id: "cohort-error-affected",
        name: "Error-Affected Sessions",
        conversionRate: sessions.size > 0 ? round((errors.length / sessions.size) * 100, 1) : 0,
        frictionScore: clamp(Math.round(errorRate * 100), 0, 100),
        change: 0
      }
    ];

    return reply.send({
      windowDays: days,
      propertyId: propertyId ?? null,
      since: since.toISOString(),
      generatedAt: new Date().toISOString(),
      summary: {
        events: events.length,
        sessions: sessions.size,
        pageViews,
        uniquePages: pages.size,
        highFrictionEvents,
        errors: errors.length,
        averageSeverity: round(averageSeverity),
        frictionScore,
        averagePageLoadMs: averagePageLoadMs === null ? null : Math.round(averagePageLoadMs),
        instrumentationCoverage: clamp(
          (events.length > 0 ? 35 : 0) +
            (sessions.size > 0 ? 20 : 0) +
            (performanceMetrics.length > 0 ? 20 : 0) +
            (pageViews > 0 ? 15 : 0) +
            (errors.length > 0 ? 10 : 0),
          0,
          100
        )
      },
      topPages: [...pageStats.values()]
        .map((page) => ({
          pageUrl: page.pageUrl,
          events: page.events,
          sessions: page.sessions.size,
          highFrictionEvents: page.highFrictionEvents,
          errors: page.errors,
          averageSeverity: page.events > 0 ? round(page.severityTotal / page.events) : 0
        }))
        .sort((a, b) => b.highFrictionEvents - a.highFrictionEvents || b.events - a.events)
        .slice(0, 8),
      eventTypes: [...eventTypes.entries()]
        .map(([eventType, count]) => ({ eventType, count }))
        .sort((a, b) => b.count - a.count),
      trend: [...dateBuckets.values()],
      paths: [...transitionCounts.values()]
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 8),
      journeys,
      alerts,
      cohorts,
      predictions: buildPredictions({
        events: events.length,
        highFrictionEvents,
        errors: errors.length,
        averagePageLoadMs: averagePageLoadMs === null ? null : Math.round(averagePageLoadMs),
        frictionScore
      })
    });
  });
};
