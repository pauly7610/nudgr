import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { getAiProvider, type AnalysisType } from "../lib/aiProviders.js";

const aiAnalyzeSchema = z.object({
  analysisType: z.enum(["journey", "cohort", "element", "general"]).default("general"),
  context: z.string().max(1000).optional()
});

export const aiRoutes: FastifyPluginAsync = async (app) => {
  app.post("/ai/analyze", { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.user as { sub?: string };
    const userId = payload?.sub;

    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parseResult = aiAnalyzeSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid AI analysis payload",
        issues: parseResult.error.flatten()
      });
    }

    const provider = getAiProvider();

    const events = await prisma.frictionEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        eventType: true,
        pageUrl: true,
        severityScore: true
      }
    });

    const analysis = await provider.analyze({
      analysisType: parseResult.data.analysisType as AnalysisType,
      context: parseResult.data.context,
      model: env.AI_PROVIDER_MODEL,
      events
    });

    return reply.send({
      provider: provider.id,
      model: env.AI_PROVIDER_MODEL,
      analysisType: parseResult.data.analysisType,
      ...analysis
    });
  });
};
