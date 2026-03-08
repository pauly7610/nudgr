import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

const getUserId = (request: { user?: unknown }): string | null => {
  const payload = request.user as { sub?: string } | undefined;
  return payload?.sub ?? null;
};

export const billingRoutes: FastifyPluginAsync = async (app) => {
  app.get("/subscription", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        tier: true,
        status: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return reply.send({ subscription });
  });

  app.get("/usage", { preHandler: app.authenticate }, async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [subscription, limits, usageRecords] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId, status: "active" },
        orderBy: { createdAt: "desc" },
        select: { tier: true }
      }),
      prisma.usageLimit.findMany(),
      prisma.usageRecord.findMany({
        where: {
          userId,
          periodStart: {
            gte: periodStart
          }
        },
        orderBy: { periodStart: "desc" }
      })
    ]);

    const tier = subscription?.tier ?? "free";
    const tierLimits = limits.filter((item: { tier: string }) => item.tier === tier);

    return reply.send({
      tier,
      limits: tierLimits,
      usageRecords
    });
  });
};
