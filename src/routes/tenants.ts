import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { authHook } from "../hooks/auth";
import { prisma } from "../lib/prisma";
import { tenantBodySchema, tenantParamsSchema } from "../lib/schemas";
import { invalidateOriginCache } from "../lib/cors-cache";
import { randomBytes } from "crypto";

function generateApiKey(): string {
  const prefix = "tlv";
  const version = "1";
  const random = randomBytes(32)
    .toString("base64url")
    .replace(/[=]/g, "");
  return `${prefix}_${version}_${random}`;
}

export async function tenantRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  app.get("/api/tenants", async (request, reply) => {
    try {
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
    } catch (error) {
      app.log.error(error, "Failed to fetch tenants");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.post("/api/tenants", async (request, reply) => {
    try {
      const userId = request.userId!;
      const { name, domains } = tenantBodySchema.parse(request.body);

      const tenant = await prisma.$transaction(async (tx) => {
        const t = await tx.tenant.create({
          data: { name, apiKey: generateApiKey(), domains: domains ?? [] },
        });
        await tx.tenantUser.create({
          data: { tenantId: t.id, userId, role: "ADMIN" },
        });
        return t;
      });

      invalidateOriginCache();
      return reply.code(201).send({ tenant });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({ message: "Invalid request body", errors: error.issues });
      }
      app.log.error(error, "Failed to create tenant");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.put("/api/tenants/:id", async (request, reply) => {
    try {
      const userId = request.userId!;
      const { id: tenantId } = tenantParamsSchema.parse(request.params);
      const { name, domains } = tenantBodySchema.parse(request.body);

      const tenantUser = await prisma.tenantUser.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
      });

      if (!tenantUser || tenantUser.role !== "ADMIN") {
        return reply.code(403).send({ message: "Forbidden: Not an admin." });
      }

      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { name, ...(domains !== undefined && { domains }) },
      });

      invalidateOriginCache();
      return { tenant: updatedTenant };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({ message: "Invalid request", errors: error.issues });
      }
      app.log.error(error, "Failed to update tenant");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.delete("/api/tenants/:id", async (request, reply) => {
    try {
      const userId = request.userId!;
      const { id: tenantId } = tenantParamsSchema.parse(request.params);

      const tenantUser = await prisma.tenantUser.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
      });

      if (!tenantUser || tenantUser.role !== "ADMIN") {
        return reply.code(403).send({ message: "Forbidden: Not an admin." });
      }

      await prisma.tenant.delete({ where: { id: tenantId } });

      invalidateOriginCache();
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({ message: "Invalid request", errors: error.issues });
      }
      app.log.error(error, "Failed to delete tenant");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });
}
