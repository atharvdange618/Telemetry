import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { createEventSchema, CreateEventInput } from "../lib/schemas";

export async function trackRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateEventInput }>(
    "/api/track",
    {
      schema: {
        body: createEventSchema,
      },
    },
    async (request, reply) => {
      const { tenantId, ...eventData } = request.body;

      try {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
        });

        if (!tenant) {
          return reply.code(403).send({
            message: "Tenant not found",
          });
        }

        await prisma.event.create({
          data: {
            tenantId: tenant.id,
            ...eventData,
          },
        });

        return reply.code(201).send({
          message: "Event Received",
        });
      } catch (error) {
        app.log.error(error, "Failed to process event");
        return reply.code(500).send({ message: "Internal server error" });
      }
    }
  );
}
