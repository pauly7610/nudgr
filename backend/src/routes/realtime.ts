import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

interface DashboardRealtimeMessage {
  type: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

const sendMessage = (
  socket: { send: (payload: string) => void },
  message: DashboardRealtimeMessage
): void => {
  socket.send(JSON.stringify(message));
};

export const realtimeRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/ws/realtime-dashboard",
    { websocket: true },
    async (socket, request) => {
      const requestUrl = new URL(request.raw.url ?? "/ws/realtime-dashboard", "http://localhost");
      const token = requestUrl.searchParams.get("token");

      if (!token) {
        sendMessage(socket, {
          type: "error",
          timestamp: new Date().toISOString(),
          data: { message: "Missing websocket token" }
        });
        socket.close(4401, "Unauthorized");
        return;
      }

      let userId: string | null = null;
      try {
        const payload = await app.jwt.verify<{ sub?: string }>(token);
        userId = payload.sub ?? null;
      } catch {
        sendMessage(socket, {
          type: "error",
          timestamp: new Date().toISOString(),
          data: { message: "Invalid websocket token" }
        });
        socket.close(4401, "Unauthorized");
        return;
      }

      if (!userId) {
        sendMessage(socket, {
          type: "error",
          timestamp: new Date().toISOString(),
          data: { message: "Invalid websocket subject" }
        });
        socket.close(4401, "Unauthorized");
        return;
      }

      let isClosed = false;
      let subscribedChannel = `user:${userId}`;

      sendMessage(socket, {
        type: "connection",
        timestamp: new Date().toISOString(),
        data: {
          status: "connected",
          channel: subscribedChannel,
          userId
        }
      });

      const interval = setInterval(async () => {
        if (isClosed) {
          return;
        }

        const [latestEvent, recentCriticalErrors] = await Promise.all([
          prisma.frictionEvent.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              eventType: true,
              pageUrl: true,
              severityScore: true,
              createdAt: true
            }
          }),
          prisma.errorLog.count({
            where: {
              userId,
              severity: "critical",
              createdAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000)
              }
            }
          })
        ]);

        if (latestEvent) {
          const messageType = latestEvent.severityScore >= 7 ? "friction_alert" : "event_update";
          sendMessage(socket, {
            type: messageType,
            timestamp: new Date().toISOString(),
            data: {
              id: latestEvent.id,
              eventType: latestEvent.eventType,
              pageUrl: latestEvent.pageUrl,
              severityScore: latestEvent.severityScore,
              createdAt: latestEvent.createdAt.toISOString(),
              channel: subscribedChannel,
              description:
                messageType === "friction_alert"
                  ? `High-severity friction detected on ${latestEvent.pageUrl}`
                  : "New friction event observed"
            }
          });
        }

        if (recentCriticalErrors > 0) {
          sendMessage(socket, {
            type: "anomaly_detected",
            timestamp: new Date().toISOString(),
            data: {
              criticalErrorsLastFiveMinutes: recentCriticalErrors,
              description: `Detected ${recentCriticalErrors} critical error(s) in the last 5 minutes`
            }
          });
        }
      }, 12000);

      socket.on("message", (raw: unknown) => {
        try {
          const parsed = JSON.parse(String(raw)) as { type?: string; channel?: string };
          if (parsed.type === "ping") {
            sendMessage(socket, {
              type: "pong",
              timestamp: new Date().toISOString()
            });
            return;
          }

          if (parsed.type === "subscribe" && typeof parsed.channel === "string" && parsed.channel.length > 0) {
            const expectedChannel = `user:${userId}`;
            subscribedChannel = parsed.channel === expectedChannel ? parsed.channel : expectedChannel;
            sendMessage(socket, {
              type: "subscribed",
              timestamp: new Date().toISOString(),
              data: { channel: subscribedChannel }
            });
          }
        } catch {
          sendMessage(socket, {
            type: "error",
            timestamp: new Date().toISOString(),
            data: { message: "Invalid realtime payload" }
          });
        }
      });

      socket.on("close", () => {
        isClosed = true;
        clearInterval(interval);
      });

      socket.on("error", () => {
        isClosed = true;
        clearInterval(interval);
      });
    }
  );
};
