import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authHook } from "../hooks/auth";
import dayjs from "dayjs";
import { statsQuerySchema } from "../lib/schemas";

export async function statsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  app.get("/api/stats/summary", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;

    const tenantAccess = await prisma.tenantUser.findUnique({
      where: {
        userId_tenantId: {
          userId: requestingUserId!,
          tenantId: tenantId,
        },
      },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const now = dayjs();
    const startDate = now
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();
    const whereClause = { tenantId, createdAt: { gte: startDate } };

    // get total page views
    const pageViews = await prisma.event.count({ where: whereClause });

    // get views per visitor
    const viewsPerVisitor = await prisma.event.groupBy({
      by: ["visitorId"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Calculate unique visitors and bounces
    const uniqueVisitors = viewsPerVisitor.length;
    const bounces = viewsPerVisitor.filter((v) => v?._count?.id === 1).length;
    const bounceRate =
      uniqueVisitors > 0 ? (bounces / uniqueVisitors) * 100 : 0;

    return {
      pageViews,
      uniqueVisitors,
      bounceRate: parseFloat(bounceRate.toFixed(1)),
    };
  });
}
