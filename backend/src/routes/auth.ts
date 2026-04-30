import bcrypt from "bcryptjs";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const googleOAuthStartQuerySchema = z.object({
  returnTo: z.string().optional()
});

const googleOAuthCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional()
});

const GOOGLE_OAUTH_PROVIDER = "google";
const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

interface OAuthStatePayload {
  provider: typeof GOOGLE_OAUTH_PROVIDER;
  returnTo: string;
  nonce: string;
  exp: number;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
}

const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  tokenId: string;
  iat: number;
  exp?: number;
}

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

const encodeBase64UrlJson = (input: object): string => {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
};

const getHeaderValue = (value: string | string[] | undefined): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

const getConfiguredOrigin = (origin: string | undefined, fallback: string): string => {
  const candidate = origin ?? fallback;
  try {
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
};

const getFrontendOrigin = (): string => {
  return getConfiguredOrigin(env.APP_ORIGIN ?? env.CORS_ORIGIN.split(",")[0]?.trim(), "http://127.0.0.1:8080");
};

const sanitizeReturnTo = (rawReturnTo: string | undefined): string => {
  if (!rawReturnTo || !rawReturnTo.startsWith("/") || rawReturnTo.startsWith("//")) {
    return "/";
  }

  return rawReturnTo;
};

const getOAuthRedirectUri = (request: { headers: Record<string, string | string[] | undefined> }): string => {
  if (env.GOOGLE_OAUTH_REDIRECT_URI) {
    return env.GOOGLE_OAUTH_REDIRECT_URI;
  }

  const host = getHeaderValue(request.headers["x-forwarded-host"]) ?? getHeaderValue(request.headers.host) ?? `127.0.0.1:${env.PORT}`;
  const protocol = getHeaderValue(request.headers["x-forwarded-proto"]) ?? (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}/auth/google/callback`;
};

const isGoogleOAuthConfigured = (): boolean => {
  return Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);
};

const signOAuthState = (payload: OAuthStatePayload): string => {
  const encodedPayload = encodeBase64UrlJson(payload);
  const signature = createHmac("sha256", env.JWT_REFRESH_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
};

const verifyOAuthState = (state: string): OAuthStatePayload => {
  const [encodedPayload, signature] = state.split(".");
  if (!encodedPayload || !signature) {
    throw new Error("Malformed OAuth state");
  }

  const expectedSignature = createHmac("sha256", env.JWT_REFRESH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid OAuth state signature");
  }

  const payload = parseBase64UrlJson<OAuthStatePayload>(encodedPayload);
  if (payload.provider !== GOOGLE_OAUTH_PROVIDER || payload.exp <= Date.now()) {
    throw new Error("Expired OAuth state");
  }

  return {
    ...payload,
    returnTo: sanitizeReturnTo(payload.returnTo)
  };
};

const buildOAuthFrontendRedirect = (params: Record<string, string>): string => {
  const redirectUrl = new URL("/auth", getFrontendOrigin());
  redirectUrl.hash = new URLSearchParams(params).toString();
  return redirectUrl.toString();
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  return response.json() as Promise<T>;
};

const signRefreshToken = (payload: Omit<RefreshTokenPayload, "type" | "iat" | "exp"> & {
  issuedAt: Date;
  expiresAt: Date | null;
}): string => {
  const header = encodeBase64UrlJson({ alg: "HS256", typ: "JWT" });
  const body = encodeBase64UrlJson({
    sub: payload.sub,
    type: "refresh",
    tokenId: payload.tokenId,
    iat: Math.floor(payload.issuedAt.getTime() / 1000),
    ...(payload.expiresAt ? { exp: Math.floor(payload.expiresAt.getTime() / 1000) } : {})
  });
  const unsignedToken = `${header}.${body}`;
  const signature = createHmac("sha256", env.JWT_REFRESH_SECRET)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
};

const parseBase64UrlJson = <T>(segment: string): T => {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T;
};

const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Malformed refresh token");
  }

  const header = parseBase64UrlJson<{ alg?: string; typ?: string }>(encodedHeader);
  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new Error("Unsupported refresh token header");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac("sha256", env.JWT_REFRESH_SECRET)
    .update(unsignedToken)
    .digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid refresh token signature");
  }

  const payload = parseBase64UrlJson<RefreshTokenPayload>(encodedPayload);
  if (payload.type !== "refresh" || !payload.sub || !payload.tokenId) {
    throw new Error("Invalid refresh token payload");
  }

  if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Refresh token expired");
  }

  return payload;
};

const toDate = (raw: unknown): Date | null => {
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const issueRefreshToken = async (userId: string): Promise<{ refreshToken: string; tokenId: string }> => {
  const tokenId = randomUUID();
  const issuedAt = new Date();
  const ttlMs = parseDurationToMs(env.JWT_REFRESH_TTL);
  const expiresAt = ttlMs ? new Date(issuedAt.getTime() + ttlMs) : null;
  const refreshToken = signRefreshToken({ sub: userId, tokenId, issuedAt, expiresAt });

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
      } as InputJsonValue
    }
  });

  return { refreshToken, tokenId };
};

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get("/auth/google", async (request, reply) => {
    if (!isGoogleOAuthConfigured()) {
      return reply.code(503).send({
        message: "Google OAuth is not configured",
        requiredEnv: ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"]
      });
    }

    const parseResult = googleOAuthStartQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.code(400).send({ message: "Invalid OAuth request" });
    }

    const state = signOAuthState({
      provider: GOOGLE_OAUTH_PROVIDER,
      returnTo: sanitizeReturnTo(parseResult.data.returnTo),
      nonce: randomUUID(),
      exp: Date.now() + 10 * 60 * 1000
    });

    const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_URL);
    authorizationUrl.search = new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      redirect_uri: getOAuthRedirectUri(request),
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      state
    }).toString();

    return reply.redirect(authorizationUrl.toString());
  });

  app.get("/auth/google/callback", async (request, reply) => {
    const parseResult = googleOAuthCallbackQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Invalid Google OAuth callback" }));
    }

    if (parseResult.data.error) {
      return reply.redirect(buildOAuthFrontendRedirect({ oauthError: `Google sign-in failed: ${parseResult.data.error}` }));
    }

    if (!isGoogleOAuthConfigured()) {
      return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Google OAuth is not configured" }));
    }

    if (!parseResult.data.code || !parseResult.data.state) {
      return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Google sign-in response was incomplete" }));
    }

    let state: OAuthStatePayload;
    try {
      state = verifyOAuthState(parseResult.data.state);
    } catch {
      return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Google sign-in state expired. Try again." }));
    }

    try {
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          code: parseResult.data.code,
          client_id: env.GOOGLE_OAUTH_CLIENT_ID ?? "",
          client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
          redirect_uri: getOAuthRedirectUri(request),
          grant_type: "authorization_code"
        })
      });
      const tokenPayload = await parseJsonResponse<GoogleTokenResponse>(tokenResponse);

      if (!tokenResponse.ok || !tokenPayload.access_token) {
        request.log.warn({ googleError: tokenPayload.error, description: tokenPayload.error_description }, "Google token exchange failed");
        return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Google token exchange failed" }));
      }

      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`
        }
      });
      const userInfo = await parseJsonResponse<GoogleUserInfoResponse>(userInfoResponse);

      const email = userInfo.email?.trim().toLowerCase();
      const isEmailVerified = userInfo.email_verified === true || userInfo.email_verified === "true";
      if (!userInfoResponse.ok || !userInfo.sub || !email || !isEmailVerified) {
        return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Google account email could not be verified" }));
      }

      const user = await prisma.$transaction(async (tx) => {
        const existingAccount = await tx.externalAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: GOOGLE_OAUTH_PROVIDER,
              providerAccountId: userInfo.sub ?? ""
            }
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          }
        });

        if (existingAccount) {
          await tx.externalAuthAccount.update({
            where: { id: existingAccount.id },
            data: {
              email,
              lastLoginAt: new Date()
            }
          });
          return existingAccount.user;
        }

        const existingUser = await tx.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            fullName: true
          }
        });

        if (existingUser) {
          return tx.user.update({
            where: { id: existingUser.id },
            data: {
              fullName: existingUser.fullName ?? userInfo.name,
              externalAuthAccounts: {
                create: {
                  provider: GOOGLE_OAUTH_PROVIDER,
                  providerAccountId: userInfo.sub ?? "",
                  email,
                  lastLoginAt: new Date()
                }
              }
            },
            select: {
              id: true,
              email: true,
              fullName: true
            }
          });
        }

        return tx.user.create({
          data: {
            email,
            passwordHash: await bcrypt.hash(randomUUID(), 12),
            fullName: userInfo.name,
            profile: { create: {} },
            subscriptions: {
              create: {
                tier: "free",
                status: "active"
              }
            },
            externalAuthAccounts: {
              create: {
                provider: GOOGLE_OAUTH_PROVIDER,
                providerAccountId: userInfo.sub ?? "",
                email,
                lastLoginAt: new Date()
              }
            }
          },
          select: {
            id: true,
            email: true,
            fullName: true
          }
        });
      });

      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventName: "auth_oauth_login",
          eventProperties: {
            provider: GOOGLE_OAUTH_PROVIDER,
            email,
            loggedInAt: new Date().toISOString()
          } as InputJsonValue
        }
      });

      const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
      const { refreshToken } = await issueRefreshToken(user.id);

      return reply.redirect(buildOAuthFrontendRedirect({
        oauth: GOOGLE_OAUTH_PROVIDER,
        accessToken,
        refreshToken,
        returnTo: state.returnTo
      }));
    } catch (error) {
      request.log.error({ err: error }, "Google OAuth callback failed");
      return reply.redirect(buildOAuthFrontendRedirect({ oauthError: "Google sign-in could not be completed" }));
    }
  });

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
    const { refreshToken } = await issueRefreshToken(user.id);

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
    const { refreshToken } = await issueRefreshToken(user.id);

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
      const payload = verifyRefreshToken(parseResult.data.refreshToken);

      const tokenHash = hashRefreshToken(parseResult.data.refreshToken);
      const persistedToken = await prisma.analyticsEvent.findFirst({
        where: {
          userId: payload.sub,
          eventName: "auth_refresh_token",
          eventProperties: {
            path: "$.tokenHash",
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
            } as InputJsonValue
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
            } as InputJsonValue
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
            } as InputJsonValue
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
      const { refreshToken, tokenId: replacementTokenId } = await issueRefreshToken(user.id);

      await prisma.analyticsEvent.update({
        where: { id: persistedToken.id },
        data: {
          eventProperties: {
            ...persistedProperties,
            revoked: true,
            revokedAt: new Date().toISOString(),
            revokedReason: "rotation",
            replacedByTokenId: replacementTokenId
          } as InputJsonValue
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
        const payload = verifyRefreshToken(refreshToken);
        const tokenHash = hashRefreshToken(refreshToken);
        const persistedToken = await prisma.analyticsEvent.findFirst({
          where: {
            userId: payload.sub,
            eventName: "auth_refresh_token",
            eventProperties: {
              path: "$.tokenHash",
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
              } as InputJsonValue
            }
          });
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
