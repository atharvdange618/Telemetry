import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { createEventSchema, CreateEventInput } from "../lib/schemas";
import { createHash } from "crypto";

async function getGeoLocation(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return { country: null, city: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    const data = await res.json();
    return { country: data.country || null, city: data.city || null };
  } catch {
    return { country: null, city: null };
  }
}

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

        const ip = request.ip;
        const { country, city } = await getGeoLocation(ip);

        console.log(
          `Tracking event for tenant ${tenantId} from IP ${ip}, country: ${country}, city: ${city}`
        );

        const userAgent = request.headers["user-agent"] || "";
        const salt = process.env.VISITOR_SALT!;
        const hashSource = `${ip}-${userAgent}-${tenant.id}-${salt}`;
        const visitorId = createHash("sha256").update(hashSource).digest("hex");

        await prisma.event.create({
          data: {
            tenantId: tenant.id,
            visitorId,
            city,
            country,
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
