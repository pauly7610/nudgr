import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import sensible from "@fastify/sensible";
import { env } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { apiKeyRoutes } from "./routes/apiKeys.js";
import { billingRoutes } from "./routes/billing.js";
import { eventRoutes } from "./routes/events.js";
import { ingestRoutes } from "./routes/ingest.js";
import { aiRoutes } from "./routes/ai.js";
import { marketingRoutes } from "./routes/marketing.js";
import { productRoutes } from "./routes/product.js";
import { realtimeRoutes } from "./routes/realtime.js";
import { authPlugin } from "./plugins/auth.js";

export const buildApp = (): FastifyInstance => {
  const app = Fastify({
    logger: env.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty"
          }
        }
      : true
  });

  void app.register(sensible);
  void app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024
    }
  });
  void app.register(websocket);
  void app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true
  });
  void app.register(authPlugin);
  void app.register(healthRoutes);
  void app.register(authRoutes);
  void app.register(apiKeyRoutes);
  void app.register(billingRoutes);
  void app.register(eventRoutes);
  void app.register(ingestRoutes);
  void app.register(aiRoutes);
  void app.register(marketingRoutes);
  void app.register(productRoutes);
  void app.register(realtimeRoutes);

  return app;
};
