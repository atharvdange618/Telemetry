import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { randomBytes } from "crypto";
import { authHook } from "../hooks/auth";
import { prisma } from "../lib/prisma";
import { shareLinkBodySchema, shareLinkParamsSchema } from "../lib/schemas";
import * as metrics from "../lib/metrics";
import { MetricsParams } from "../lib/metrics";

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function resolveDateRange(query: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  const now = new Date();
  if (query.startDate && query.endDate) {
    return {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
    };
  }
  const periodMap: Record<string, number> = {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  const days = periodMap[query.period || "24h"] || 1;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate: now };
}

function segmentFilters(config: Record<string, string | undefined>) {
  const filters: Record<string, any> = {};
  if (config.browser) filters.browser = config.browser;
  if (config.os) filters.os = config.os;
  if (config.country) filters.country = config.country;
  if (config.language) filters.language = config.language;
  if (config.device) Object.assign(filters, metrics.deviceSegmentFilter(config.device));
  return filters;
}

export async function shareLinksRoutes(app: FastifyInstance) {
  app.register(async (privateApp) => {
    privateApp.addHook("preHandler", authHook);

    privateApp.post("/api/share-links", async (request, reply) => {
      try {
        const userId = request.userId!;
        const body = shareLinkBodySchema.parse(request.body);

        const access = await prisma.tenantUser.findUnique({
          where: { userId_tenantId: { userId, tenantId: body.tenantId } },
        });
        if (!access) {
          return reply.code(403).send({ message: "Forbidden" });
        }

        const token = generateToken();
        const shareLink = await prisma.shareLink.create({
          data: {
            token,
            tenantId: body.tenantId,
            label: body.label || null,
            config: body.config,
            createdBy: userId,
          },
        });

        return reply.code(201).send({ shareLink });
      } catch (error) {
        if (error instanceof ZodError) {
          return reply
            .code(400)
            .send({ message: "Invalid request body", errors: error.issues });
        }
        privateApp.log.error(error, "Failed to create share link");
        return reply.code(500).send({ message: "Internal server error" });
      }
    });

    privateApp.get("/api/share-links", async (request, reply) => {
      try {
        const userId = request.userId!;
        const { tenantId } = request.query as { tenantId?: string };

        if (!tenantId) {
          return reply.code(400).send({ message: "tenantId is required" });
        }

        const access = await prisma.tenantUser.findUnique({
          where: { userId_tenantId: { userId, tenantId } },
        });
        if (!access) {
          return reply.code(403).send({ message: "Forbidden" });
        }

        const shareLinks = await prisma.shareLink.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
        });

        return { shareLinks };
      } catch (error) {
        privateApp.log.error(error, "Failed to list share links");
        return reply.code(500).send({ message: "Internal server error" });
      }
    });

    privateApp.delete("/api/share-links/:id", async (request, reply) => {
      try {
        const userId = request.userId!;
        const { id } = shareLinkParamsSchema.parse(request.params);

        const shareLink = await prisma.shareLink.findUnique({ where: { id } });
        if (!shareLink) {
          return reply.code(404).send({ message: "Share link not found" });
        }

        if (shareLink.createdBy !== userId) {
          return reply.code(403).send({ message: "Forbidden" });
        }

        await prisma.shareLink.delete({ where: { id } });
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof ZodError) {
          return reply
            .code(400)
            .send({ message: "Invalid request params", errors: error.issues });
        }
        privateApp.log.error(error, "Failed to delete share link");
        return reply.code(500).send({ message: "Internal server error" });
      }
    });
  });

  app.get("/api/shared/:token", async (request, reply) => {
    try {
      const { token } = request.params as { token: string };
      const shareLink = await prisma.shareLink.findUnique({
        where: { token },
        include: { user: { select: { name: true } } },
      });

      if (!shareLink) {
        return reply.code(404).send({ message: "Share link not found" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: shareLink.tenantId },
        select: { name: true },
      });

      return {
        id: shareLink.id,
        label: shareLink.label || tenant?.name || "Dashboard",
        config: shareLink.config,
        createdAt: shareLink.createdAt,
      };
    } catch (error) {
      app.log.error(error, "Failed to fetch share link");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  const sharedStatsHandlers = new Map<
    string,
    (params: MetricsParams) => Promise<unknown>
  >([
    ["summary", metrics.getSummary],
    ["pages", metrics.getTopPages],
    ["referrers", metrics.getReferrers],
    ["views-over-time", metrics.getViewsOverTime],
    ["sources", metrics.getSources],
    ["goals", metrics.getGoals],
    ["locations", metrics.getLocations],
    ["cities", metrics.getCities],
    ["devices", metrics.getDevices],
    ["engagement", metrics.getEngagement],
    ["campaigns", metrics.getCampaigns],
    ["compare", metrics.getCompare],
    ["browsers", metrics.getBrowsers],
    ["os", metrics.getOperatingSystems],
    ["languages", metrics.getLanguages],
    ["sessions", metrics.getSessions],
    ["scroll-depth", metrics.getScrollDepth],
    ["performance", metrics.getPerformance],
    ["outbound", metrics.getOutbound],
    ["insights", metrics.getInsights],
  ]);

  app.get("/api/shared/:token/stats/:type", async (request, reply) => {
    try {
      const { token, type } = request.params as { token: string; type: string };
      const shareLink = await prisma.shareLink.findUnique({ where: { token } });

      if (!shareLink) {
        return reply.code(404).send({ message: "Share link not found" });
      }

      const handler = sharedStatsHandlers.get(type);
      if (!handler) {
        return reply.code(400).send({ message: `Unknown stats type: ${type}` });
      }

      const config = shareLink.config as Record<string, any>;
      const query = request.query as Record<string, string>;

      const params = {
        tenantId: shareLink.tenantId,
        period: query.period || config.period || "24h",
        startDate: query.startDate || config.startDate,
        endDate: query.endDate || config.endDate,
        ...((config.segments as Record<string, string>) || {}),
      };

      const { startDate, endDate } = resolveDateRange(params);
      const segments = segmentFilters(params as Record<string, string>);

      const data = await handler({
        tenantId: shareLink.tenantId,
        startDate,
        endDate,
        segments,
      });
      return data;
    } catch (error) {
      app.log.error(error, "Failed to fetch shared stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });
}
