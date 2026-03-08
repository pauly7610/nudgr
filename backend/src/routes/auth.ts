import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

type AnalyticsEventPropertiesInput = NonNullable<
  Parameters<typeof prisma.analyticsEvent.create>[0]["data"]["eventProperties"]
>;

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const asObject = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as Record<string, unknown>;
};

const parseDurationToMs = (duration: string): number | null => {
  const parsed = /^(\d+)([smhd])$/i.exec(duration.trim());
  if (!parsed) {
    return null;
  }

  const amount = Number(parsed[1]);
  const unit = parsed[2].toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  };

  const multiplier = unitToMs[unit];
  return multiplier ? amount * multiplier : null;
};

const toDate = (raw: unknown): Date | null => {
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const issueRefreshToken = async (app: {
  jwt: {
    sign: (payload: Record<string, unknown>, options: { expiresIn: string }) => string | Promise<string>;
  };
}, userId: string): Promise<{ refreshToken: string; tokenId: string }> => {
  const tokenId = randomUUID();
  const issuedAt = new Date();
  const ttlMs = parseDurationToMs(env.JWT_REFRESH_TTL);
  const expiresAt = ttlMs ? new Date(issuedAt.getTime() + ttlMs) : null;
  const refreshToken = await app.jwt.sign(
    { sub: userId, type: "refresh", tokenId },
    { expiresIn: env.JWT_REFRESH_TTL }
  );

  await prisma.analyticsEvent.create({
    data: {
      userId,
      eventName: "auth_refresh_token",
      eventProperties: {
        tokenId,
        tokenHash: hashRefreshToken(refreshToken),
        revoked: false,
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt?.toISOString() ?? null
      } as AnalyticsEventPropertiesInput
    }
  });

  return { refreshToken, tokenId };
};

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/signup", async (request, reply) => {
    const parseResult = signupSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid signup payload",
        issues: parseResult.error.flatten()
      });
    }

    const { email, password, fullName } = parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        profile: { create: {} },
        subscriptions: {
          create: {
            tier: "free",
            status: "active"
          }
        }
      },
      select: {
        id: true,
        email: true,
        fullName: true
      }
    });

    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
    const { refreshToken } = await issueRefreshToken(app, user.id);

    return reply.code(201).send({ user, accessToken, refreshToken });
  });

  app.post("/auth/login", async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({
        message: "Invalid login payload",
        issues: parseResult.error.flatten()
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
    const { refreshToken } = await issueRefreshToken(app, user.id);

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      },
      accessToken,
      refreshToken
    });
  });

  app.post("/auth/refresh", async (request, reply) => {
    const parseResult = z.object({ refreshToken: z.string().min(1) }).safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Missing refresh token" });
    }

    try {
      const payload = await app.jwt.verify<{ sub: string; type?: string; tokenId?: string }>(parseResult.data.refreshToken);
      if (payload.type !== "refresh" || !payload.tokenId) {
        return reply.code(401).send({ message: "Invalid token type" });
      }

      const tokenHash = hashRefreshToken(parseResult.data.refreshToken);
      const persistedToken = await prisma.analyticsEvent.findFirst({
        where: {
          userId: payload.sub,
          eventName: "auth_refresh_token",
          eventProperties: {
            path: ["tokenHash"],
            equals: tokenHash
          }
        },
        select: {
          id: true,
          eventProperties: true
        }
      });

      if (!persistedToken) {
        await prisma.analyticsEvent.create({
          data: {
            userId: payload.sub,
            eventName: "auth_refresh_token_reuse",
            eventProperties: {
              tokenId: payload.tokenId,
              reason: "not_found",
              detectedAt: new Date().toISOString()
            } as AnalyticsEventPropertiesInput
          }
        });
        return reply.code(401).send({ message: "Invalid refresh token" });
      }

      const persistedProperties = asObject(persistedToken.eventProperties);
      if (persistedProperties.revoked === true) {
        await prisma.analyticsEvent.update({
          where: { id: persistedToken.id },
          data: {
            eventProperties: {
              ...persistedProperties,
              reuseDetected: true,
              reuseDetectedAt: new Date().toISOString(),
              reuseReason: "replay_after_revocation"
            } as AnalyticsEventPropertiesInput
          }
        });
        return reply.code(401).send({ message: "Refresh token revoked" });
      }

      const expiresAt = toDate(persistedProperties.expiresAt);
      if (expiresAt && expiresAt.getTime() <= Date.now()) {
        await prisma.analyticsEvent.update({
          where: { id: persistedToken.id },
          data: {
            eventProperties: {
              ...persistedProperties,
              revoked: true,
              revokedAt: new Date().toISOString(),
              revokedReason: "expired"
            } as AnalyticsEventPropertiesInput
          }
        });
        return reply.code(401).send({ message: "Refresh token expired" });
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, fullName: true }
      });

      if (!user) {
        return reply.code(401).send({ message: "User not found" });
      }

      const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
      const { refreshToken, tokenId: replacementTokenId } = await issueRefreshToken(app, user.id);

      await prisma.analyticsEvent.update({
        where: { id: persistedToken.id },
        data: {
          eventProperties: {
            ...persistedProperties,
            revoked: true,
            revokedAt: new Date().toISOString(),
            revokedReason: "rotation",
            replacedByTokenId: replacementTokenId
          } as AnalyticsEventPropertiesInput
        }
      });

      return reply.send({ user, accessToken, refreshToken });
    } catch {
      return reply.code(401).send({ message: "Invalid refresh token" });
    }
  });

  app.get("/auth/me", { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.user as { sub?: string };
    const userId = payload?.sub;

    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        subscriptions: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { tier: true, status: true }
        }
      }
    });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    return reply.send(user);
  });

  app.post("/auth/logout", async (request, reply) => {
    const parseResult = z.object({ refreshToken: z.string().min(1).optional() }).safeParse(request.body ?? {});
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid logout payload" });
    }

    const refreshToken = parseResult.data.refreshToken;
    if (refreshToken) {
      try {
        const payload = await app.jwt.verify<{ sub: string; type?: string }>(refreshToken);
        if (payload.type === "refresh") {
          const tokenHash = hashRefreshToken(refreshToken);
          const persistedToken = await prisma.analyticsEvent.findFirst({
            where: {
              userId: payload.sub,
              eventName: "auth_refresh_token",
              eventProperties: {
                path: ["tokenHash"],
                equals: tokenHash
              }
            },
            select: {
              id: true,
              eventProperties: true
            }
          });

          if (persistedToken) {
            await prisma.analyticsEvent.update({
              where: { id: persistedToken.id },
              data: {
                eventProperties: {
                  ...asObject(persistedToken.eventProperties),
                  revoked: true,
                  revokedAt: new Date().toISOString(),
                  revokedReason: "logout"
                } as AnalyticsEventPropertiesInput
              }
            });
          }
        }
      } catch {
        // Invalid refresh token still results in a successful local logout response.
      }
    }

    return reply.send({ ok: true });
  });

  app.get("/auth/token-hygiene-summary", { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.user as { sub?: string };
    const userId = payload?.sub;
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const windowDays = 30;
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
    const [tokenEvents, reuseSignals] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: {
          userId,
          eventName: "auth_refresh_token",
          createdAt: { gte: since }
        },
        select: {
          createdAt: true,
          eventProperties: true
        }
      }),
      prisma.analyticsEvent.count({
        where: {
          userId,
          eventName: "auth_refresh_token_reuse",
          createdAt: { gte: since }
        }
      })
    ]);

    let revokedTokens = 0;
    let rotatedTokens = 0;
    let activeTokens = 0;
    let expiredTokens = 0;
    let replayDetections = 0;
    let logoutRevocations = 0;

    const now = Date.now();
    for (const tokenEvent of tokenEvents) {
      const properties = asObject(tokenEvent.eventProperties);
      const isRevoked = properties.revoked === true;
      const isReused = properties.reuseDetected === true;
      const revokedReason = properties.revokedReason;
      const expiresAt = toDate(properties.expiresAt);

      if (isRevoked) {
        revokedTokens += 1;
      }
      if (typeof properties.replacedByTokenId === "string" && properties.replacedByTokenId.length > 0) {
        rotatedTokens += 1;
      }
      if (isReused) {
        replayDetections += 1;
      }
      if (revokedReason === "logout") {
        logoutRevocations += 1;
      }

      const isExpired = Boolean(expiresAt && expiresAt.getTime() <= now);
      if (isExpired) {
        expiredTokens += 1;
      }

      if (!isRevoked && !isExpired) {
        activeTokens += 1;
      }
    }

    return reply.send({
      windowDays,
      since: since.toISOString(),
      summary: {
        issuedTokens: tokenEvents.length,
        activeTokens,
        revokedTokens,
        rotatedTokens,
        expiredTokens,
        logoutRevocations,
        reuseDetections: replayDetections + reuseSignals
      }
    });
  });
};
