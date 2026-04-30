import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const AUTH_DISABLED_USER = {
  sub: "local-demo-user",
  email: "demo@nudgr.local"
};

let demoUserReady = false;

const ensureDemoUser = async (app: FastifyInstance): Promise<void> => {
  if (demoUserReady) {
    return;
  }

  try {
    await prisma.user.upsert({
      where: { id: AUTH_DISABLED_USER.sub },
      update: {
        email: AUTH_DISABLED_USER.email,
        fullName: "Local Demo"
      },
      create: {
        id: AUTH_DISABLED_USER.sub,
        email: AUTH_DISABLED_USER.email,
        passwordHash: "auth-disabled",
        fullName: "Local Demo",
        profile: { create: {} },
        subscriptions: {
          create: {
            tier: "free",
            status: "active"
          }
        }
      }
    });
    demoUserReady = true;
  } catch (error) {
    app.log.warn({ err: error }, "Auth-disabled demo user could not be prepared");
  }
};

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: import("fastify").FastifyRequest,
      reply: import("fastify").FastifyReply
    ) => Promise<void>;
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_TTL
    }
  });

  app.decorate("authenticate", async (request, reply) => {
    if (env.DISABLE_AUTH) {
      request.user = AUTH_DISABLED_USER;
      await ensureDemoUser(app);
      return;
    }

    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ message: "Unauthorized" });
    }
  });
});
