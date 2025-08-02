import { FastifyInstance } from "fastify";
import { authHook } from "../hooks/auth";
import { prisma } from "../lib/prisma";
import { tenantBodySchema, tenantParamsSchema } from "../lib/schemas";

export async function tenantRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  // GET /api/tenants
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

  // POST /api/tenants - Create a new tenant
  app.post("/api/tenants", async (request, reply) => {
    const userId = request.userId!;
    const { name } = tenantBodySchema.parse(request.body);

    const tenant = await prisma.$transaction(async (tx) => {
      const t = await tx.tenant.create({ data: { name } });
      await tx.tenantUser.create({
        data: { tenantId: t.id, userId, role: "ADMIN" },
      });
      return t;
    });

    return reply.code(201).send({ tenant });
  });

  // PUT /api/tenants/:id - Rename a tenant
  app.put("/api/tenants/:id", async (request, reply) => {
    const userId = request.userId!;
    const { id: tenantId } = tenantParamsSchema.parse(request.params);
    const { name } = tenantBodySchema.parse(request.body);

    const tenantUser = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });

    if (!tenantUser || tenantUser.role !== "ADMIN") {
      return reply.code(403).send({ message: "Forbidden: Not an admin." });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { name },
    });

    return { tenant: updatedTenant };
  });

  // DELETE /api/tenants/:id - Delete a tenant
  app.delete("/api/tenants/:id", async (request, reply) => {
    const userId = request.userId!;
    const { id: tenantId } = tenantParamsSchema.parse(request.params);

    const tenantUser = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });

    if (!tenantUser || tenantUser.role !== "ADMIN") {
      return reply.code(403).send({ message: "Forbidden: Not an admin." });
    }

    await prisma.tenant.delete({ where: { id: tenantId } });

    return reply.code(204).send();
  });
}
