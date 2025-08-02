import { FastifyInstance } from "fastify";
import { authHook } from "../hooks/auth";
import { prisma } from "../lib/prisma";

export async function tenantRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  app.get("/api/tenants", async (request, reply) => {
    const userId = request.userId!;

    const tenants = await prisma.tenant.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });

    return { tenants };
  });
}
