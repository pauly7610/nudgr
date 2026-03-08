import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { downloadObject, uploadObject } from "../lib/storage.js";
import { renderExportPdf } from "../lib/pdfExport.js";

type DashboardLayoutInput = Parameters<typeof prisma.dashboardConfig.create>[0]["data"]["layout"];
type DashboardFiltersInput = Parameters<typeof prisma.dashboardConfig.create>[0]["data"]["filters"];
type DashboardConfigUpdateData = Parameters<typeof prisma.dashboardConfig.update>[0]["data"];
type AlertConditionsInput = Parameters<typeof prisma.alertConfig.create>[0]["data"]["conditions"];
type AlertConfigUpdateData = Parameters<typeof prisma.alertConfig.update>[0]["data"];
type ExportJobParametersInput = Parameters<typeof prisma.exportJob.create>[0]["data"]["parameters"];

const getUserId = (request: { user?: unknown }): string | null => {
  const payload = request.user as { sub?: string } | undefined;
  return payload?.sub ?? null;
};

const dashboardSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  layout: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).default([]),
  filters: z.record(z.string(), z.unknown()).default({}),
  isDefault: z.boolean().default(false),
  isShared: z.boolean().default(false),
  sharedWithRoles: z.array(z.string().min(1)).default([])
});

const dashboardUpdateSchema = dashboardSchema.partial();

const alertSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  alertType: z.string().min(1),
  conditions: z.record(z.string(), z.unknown()).default({}),
  notificationChannels: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().default(true)
});

const alertUpdateSchema = alertSchema.partial();

const teamMemberSchema = z.object({
  memberEmail: z.string().email(),
  role: z.string().min(1).default("viewer")
});

const abTestSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  variants: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    weight: z.number().min(0).max(100)
  })).min(2),
  isActive: z.boolean().default(true)
});

const abTestUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  variants: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    weight: z.number().min(0).max(100)
  })).min(2).optional(),
  isActive: z.boolean().optional()
});

const exportPdfSchema = z.object({
  reportType: z.string().min(1),
  filters: z.record(z.string(), z.unknown()).default({}),
  userId: z.string().min(1).optional()
});

const idParamSchema = z.object({
  id: z.string().min(1)
});

const decodeStorageKey = (rawPath: string): string => decodeURIComponent(rawPath).replace(/^\/+/, "");

const isStoragePathOwnedByUser = (storagePath: string, userId: string): boolean => {
  const segments = storagePath.split("/");
  return segments.length > 1 && segments[1] === userId;
};

const parseOptionalDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
};

interface AbVariantConfig {
  id: string;
  name: string;
  weight: number;
}

interface AbVariantPosterior {
  id: string;
  name: string;
  weight: number;
  exposures: number;
  conversions: number;
  posteriorAlpha: number;
  posteriorBeta: number;
  posteriorMean: number;
  posteriorVariance: number;
}

const parseVariants = (raw: unknown): AbVariantConfig[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const typed = entry as { id?: unknown; name?: unknown; weight?: unknown };
      if (typeof typed.id !== "string" || typeof typed.name !== "string") {
        return null;
      }

      return {
        id: typed.id,
        name: typed.name,
        weight: typeof typed.weight === "number" ? typed.weight : 0
      } satisfies AbVariantConfig;
    })
    .filter((entry): entry is AbVariantConfig => Boolean(entry));
};

const toMetadataObject = (raw: unknown): Record<string, unknown> | null => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  return raw as Record<string, unknown>;
};

const erf = (x: number): number => {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * absX);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-absX * absX));
  return sign * y;
};

const estimateWinProbability = (winner: AbVariantPosterior, runnerUp: AbVariantPosterior | undefined): number => {
  if (!runnerUp) {
    return 1;
  }

  const variance = winner.posteriorVariance + runnerUp.posteriorVariance;
  if (variance <= 0) {
    return 0.5;
  }

  const z = (winner.posteriorMean - runnerUp.posteriorMean) / Math.sqrt(variance);
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
};

export const productRoutes: FastifyPluginAsync = async (app) => {
  app.get("/dashboard-configs", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const configs = await prisma.dashboardConfig.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return reply.send(configs);
  });

  app.post("/dashboard-configs", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = dashboardSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid dashboard payload", issues: parseResult.error.flatten() });
    }

    const created = await prisma.dashboardConfig.create({
      data: {
        userId,
        name: parseResult.data.name,
        description: parseResult.data.description,
        layout: parseResult.data.layout as DashboardLayoutInput,
        filters: parseResult.data.filters as DashboardFiltersInput,
        isDefault: parseResult.data.isDefault,
        isShared: parseResult.data.isShared,
        sharedWithRoles: parseResult.data.sharedWithRoles
      }
    });

    return reply.code(201).send(created);
  });

  app.patch("/dashboard-configs/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const idParse = idParamSchema.safeParse(request.params);
    if (!idParse.success) {
      return reply.code(400).send({ message: "Invalid dashboard id" });
    }

    const parseResult = dashboardUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid dashboard payload", issues: parseResult.error.flatten() });
    }

    const existing = await prisma.dashboardConfig.findFirst({ where: { id: idParse.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "Dashboard config not found" });
    }

    const updatedPayload: DashboardConfigUpdateData = {
      name: parseResult.data.name,
      description: parseResult.data.description,
      isDefault: parseResult.data.isDefault,
      isShared: parseResult.data.isShared,
      sharedWithRoles: parseResult.data.sharedWithRoles
    };

    if (parseResult.data.layout !== undefined) {
      updatedPayload.layout = parseResult.data.layout as DashboardLayoutInput;
    }

    if (parseResult.data.filters !== undefined) {
      updatedPayload.filters = parseResult.data.filters as DashboardFiltersInput;
    }

    const updated = await prisma.dashboardConfig.update({
      where: { id: idParse.data.id },
      data: updatedPayload
    });

    return reply.send(updated);
  });

  app.get("/alerts", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const alerts = await prisma.alertConfig.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return reply.send(alerts);
  });

  app.post("/alerts", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = alertSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid alert payload", issues: parseResult.error.flatten() });
    }

    const created = await prisma.alertConfig.create({
      data: {
        userId,
        name: parseResult.data.name,
        description: parseResult.data.description,
        alertType: parseResult.data.alertType,
        conditions: parseResult.data.conditions as AlertConditionsInput,
        notificationChannels: parseResult.data.notificationChannels,
        isActive: parseResult.data.isActive
      }
    });

    return reply.code(201).send(created);
  });

  app.patch("/alerts/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const idParse = idParamSchema.safeParse(request.params);
    if (!idParse.success) {
      return reply.code(400).send({ message: "Invalid alert id" });
    }

    const parseResult = alertUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid alert payload", issues: parseResult.error.flatten() });
    }

    const existing = await prisma.alertConfig.findFirst({ where: { id: idParse.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "Alert not found" });
    }

    const updatedPayload: AlertConfigUpdateData = {
      name: parseResult.data.name,
      description: parseResult.data.description,
      alertType: parseResult.data.alertType,
      notificationChannels: parseResult.data.notificationChannels,
      isActive: parseResult.data.isActive
    };

    if (parseResult.data.conditions !== undefined) {
      updatedPayload.conditions = parseResult.data.conditions as AlertConditionsInput;
    }

    const updated = await prisma.alertConfig.update({
      where: { id: idParse.data.id },
      data: updatedPayload
    });

    return reply.send(updated);
  });

  app.get("/team-members", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const members = await prisma.teamMember.findMany({
      where: {
        OR: [{ teamOwnerId: userId }, { memberUserId: userId }]
      },
      orderBy: { invitedAt: "desc" }
    });

    return reply.send(members);
  });

  app.post("/team-members", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = teamMemberSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid team member payload", issues: parseResult.error.flatten() });
    }

    const created = await prisma.teamMember.create({
      data: {
        teamOwnerId: userId,
        memberEmail: parseResult.data.memberEmail,
        role: parseResult.data.role,
        status: "pending"
      }
    });

    return reply.code(201).send(created);
  });

  app.delete("/team-members/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const idParse = idParamSchema.safeParse(request.params);
    if (!idParse.success) {
      return reply.code(400).send({ message: "Invalid team member id" });
    }

    const existing = await prisma.teamMember.findFirst({
      where: { id: idParse.data.id, teamOwnerId: userId }
    });
    if (!existing) {
      return reply.code(404).send({ message: "Team member not found" });
    }

    await prisma.teamMember.delete({ where: { id: idParse.data.id } });

    return reply.send({ ok: true });
  });

  app.get("/ab-tests", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const tests = await prisma.abTest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return reply.send(tests);
  });

  app.post("/ab-tests", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = abTestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid A/B test payload", issues: parseResult.error.flatten() });
    }

    const created = await prisma.abTest.create({
      data: {
        userId,
        name: parseResult.data.name,
        description: parseResult.data.description,
        variants: parseResult.data.variants,
        isActive: parseResult.data.isActive
      }
    });

    return reply.code(201).send(created);
  });

  app.patch("/ab-tests/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const idParse = idParamSchema.safeParse(request.params);
    if (!idParse.success) {
      return reply.code(400).send({ message: "Invalid A/B test id" });
    }

    const parseResult = abTestUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid A/B test payload", issues: parseResult.error.flatten() });
    }

    const existing = await prisma.abTest.findFirst({ where: { id: idParse.data.id, userId } });
    if (!existing) {
      return reply.code(404).send({ message: "A/B test not found" });
    }

    const updated = await prisma.abTest.update({
      where: { id: idParse.data.id },
      data: parseResult.data
    });

    return reply.send(updated);
  });

  app.get("/ab-tests/:id/bayesian-summary", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const idParse = idParamSchema.safeParse(request.params);
    if (!idParse.success) {
      return reply.code(400).send({ message: "Invalid A/B test id" });
    }

    const abTest = await prisma.abTest.findFirst({
      where: { id: idParse.data.id, userId }
    });
    if (!abTest) {
      return reply.code(404).send({ message: "A/B test not found" });
    }

    const variants = parseVariants(abTest.variants);
    if (variants.length < 2) {
      return reply.code(400).send({ message: "A/B test must have at least two variants" });
    }

    const recentEvents = await prisma.frictionEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        metadata: true
      },
      take: 5000,
      orderBy: {
        createdAt: "desc"
      }
    });

    const counters = new Map<string, { exposures: number; conversions: number }>();
    for (const variant of variants) {
      counters.set(variant.id, { exposures: 0, conversions: 0 });
    }

    for (const event of recentEvents) {
      const metadata = toMetadataObject(event.metadata);
      if (!metadata) {
        continue;
      }

      const eventTestId = metadata.abTestId;
      const eventVariantId = metadata.variantId;
      const eventConverted = metadata.converted;
      if (eventTestId !== abTest.id || typeof eventVariantId !== "string") {
        continue;
      }

      const counter = counters.get(eventVariantId);
      if (!counter) {
        continue;
      }

      counter.exposures += 1;
      if (eventConverted === true) {
        counter.conversions += 1;
      }
    }

    const posteriors = variants.map((variant) => {
      const counts = counters.get(variant.id) ?? { exposures: 0, conversions: 0 };
      const alpha = 1 + counts.conversions;
      const beta = 1 + Math.max(0, counts.exposures - counts.conversions);
      const mean = alpha / (alpha + beta);
      const variance = (alpha * beta) / (((alpha + beta) ** 2) * (alpha + beta + 1));

      return {
        id: variant.id,
        name: variant.name,
        weight: variant.weight,
        exposures: counts.exposures,
        conversions: counts.conversions,
        posteriorAlpha: alpha,
        posteriorBeta: beta,
        posteriorMean: Number(mean.toFixed(6)),
        posteriorVariance: Number(variance.toFixed(8))
      } satisfies AbVariantPosterior;
    }).sort((a, b) => b.posteriorMean - a.posteriorMean);

    const winner = posteriors[0];
    const runnerUp = posteriors[1];
    const winProbability = estimateWinProbability(winner, runnerUp);

    return reply.send({
      abTestId: abTest.id,
      analyzedWindowDays: 30,
      winnerVariantId: winner.id,
      winnerProbability: Number(winProbability.toFixed(4)),
      variants: posteriors
    });
  });

  app.get("/recordings", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const recordings = await prisma.sessionRecording.findMany({
      where: {
        OR: [
          {
            metadata: {
              path: ["userId"],
              equals: userId
            }
          },
          {
            sessionId: {
              startsWith: userId.slice(0, 8)
            }
          }
        ]
      },
      orderBy: { recordingStart: "desc" }
    });

    return reply.send(recordings.map((recording: (typeof recordings)[number]) => ({
      id: recording.id,
      session_id: recording.sessionId,
      storage_path: recording.storagePath,
      recording_start: recording.recordingStart.toISOString(),
      duration_seconds: recording.durationSeconds,
      friction_events_count: recording.frictionEventsCount,
      metadata: recording.metadata
    })));
  });

  app.get("/export-jobs", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const jobs = await prisma.exportJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return reply.send(jobs.map((job: (typeof jobs)[number]) => ({
      id: job.id,
      export_type: job.exportType,
      created_at: job.createdAt.toISOString(),
      status: job.status,
      storage_path: job.storagePath
    })));
  });

  app.post("/api/export-pdf", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = exportPdfSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid export payload", issues: parseResult.error.flatten() });
    }

    if (parseResult.data.userId && parseResult.data.userId !== userId) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const startDate = parseOptionalDate(parseResult.data.filters.startDate);
    const endDate = parseOptionalDate(parseResult.data.filters.endDate);

    const createdAtRange = {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {})
    };

    const [events, errors] = await Promise.all([
      prisma.frictionEvent.findMany({
        where: {
          userId,
          ...(startDate || endDate ? { createdAt: createdAtRange } : {})
        },
        orderBy: { createdAt: "desc" },
        take: 500
      }),
      prisma.errorLog.findMany({
        where: {
          userId,
          ...(startDate || endDate ? { createdAt: createdAtRange } : {})
        },
        orderBy: { createdAt: "desc" },
        take: 500
      })
    ]);

    const pageAggregate = new Map<string, { count: number; severityTotal: number }>();
    for (const event of events) {
      const pageUrl = event.pageUrl || "unknown";
      const current = pageAggregate.get(pageUrl) ?? { count: 0, severityTotal: 0 };
      current.count += 1;
      current.severityTotal += event.severityScore;
      pageAggregate.set(pageUrl, current);
    }

    const topPages = [...pageAggregate.entries()]
      .map(([pageUrl, stats]) => ({
        pageUrl,
        events: stats.count,
        avgSeverity: stats.count > 0 ? stats.severityTotal / stats.count : 0
      }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 10);

    const averageSeverity = events.length > 0
      ? events.reduce((acc: number, event: (typeof events)[number]) => acc + event.severityScore, 0) / events.length
      : 0;
    const criticalErrors = errors.filter((error: (typeof errors)[number]) => error.severity === "critical").length;

    const pdfContent = await renderExportPdf({
      reportType: parseResult.data.reportType,
      userId,
      generatedAt: new Date(),
      startDate,
      endDate,
      totalEvents: events.length,
      totalErrors: errors.length,
      criticalErrors,
      averageSeverity,
      topPages
    });

    const storagePath = `exports/${userId}/report-${Date.now()}.pdf`;

    await uploadObject({
      key: storagePath,
      body: pdfContent,
      contentType: "application/pdf"
    });

    await prisma.exportJob.create({
      data: {
        userId,
        exportType: "pdf",
        status: "completed",
        storagePath,
        parameters: {
          reportType: parseResult.data.reportType,
          filters: parseResult.data.filters
        } as ExportJobParametersInput,
        completedAt: new Date()
      }
    });

    return reply.code(202).send({
      ok: true,
      downloadUrl: `/exports/${encodeURIComponent(storagePath)}`
    });
  });

  app.get("/recordings/*", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const rawPath = z.string().min(1).safeParse((request.params as { "*"?: string })["*"]);
    if (!rawPath.success) {
      return reply.code(400).send({ message: "Invalid recording path" });
    }

    const storagePath = decodeStorageKey(rawPath.data);

    const recording = await prisma.sessionRecording.findFirst({
      where: { storagePath }
    });

    if (!recording) {
      return reply.code(404).send({ message: "Recording file not found" });
    }

    const metadataUserId =
      recording.metadata && typeof recording.metadata === "object" && !Array.isArray(recording.metadata)
        ? (recording.metadata as Record<string, unknown>).userId
        : undefined;

    if (metadataUserId !== userId) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    try {
      const object = await downloadObject(recording.storagePath);
      if (object.contentType) {
        reply.type(object.contentType);
      }

      return reply.send(object.body);
    } catch {
      return reply.code(404).send({ message: "Recording object not found in storage" });
    }
  });

  app.get("/exports/*", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const rawPath = z.string().min(1).safeParse((request.params as { "*"?: string })["*"]);
    if (!rawPath.success) {
      return reply.code(400).send({ message: "Invalid export path" });
    }

    const storagePath = decodeStorageKey(rawPath.data);

    const exportJob = await prisma.exportJob.findFirst({
      where: { storagePath }
    });

    if (!exportJob) {
      return reply.code(404).send({ message: "Export file not found" });
    }

    if (exportJob.userId !== userId) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    try {
      const object = await downloadObject(exportJob.storagePath ?? "");
      if (object.contentType) {
        reply.type(object.contentType);
      }

      return reply.send(object.body);
    } catch {
      return reply.code(404).send({ message: "Export object not found in storage" });
    }
  });

  app.get("/screenshots/*", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const rawPath = z.string().min(1).safeParse((request.params as { "*"?: string })["*"]);
    if (!rawPath.success) {
      return reply.code(400).send({ message: "Invalid screenshot path" });
    }

    const storagePath = decodeStorageKey(rawPath.data);

    if (!isStoragePathOwnedByUser(storagePath, userId)) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    try {
      const object = await downloadObject(storagePath);
      if (object.contentType) {
        reply.type(object.contentType);
      }

      return reply.send(object.body);
    } catch {
      return reply.code(404).send({ message: "Screenshot object not found in storage" });
    }
  });
};
