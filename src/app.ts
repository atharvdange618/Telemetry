import Fastify, { FastifyServerOptions } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import path from "path";

import { trackRoutes } from "./routes/track";
import { authRoutes } from "./routes/auth";
import { statsRoutes } from "./routes/stats";
import { tenantRoutes } from "./routes/tenants";
import { shareLinksRoutes } from "./routes/share-links";

// Builds the app without listening, so tests can drive the real plugin and
// CORS wiring through app.inject().
export function buildApp(logger: FastifyServerOptions["logger"] = false) {
  const app = Fastify({
    // Exactly one reverse proxy (nginx) sits in front of this process on the
    // same host. trustProxy: true would trust the entire client-supplied
    // X-Forwarded-For chain, letting a client spoof request.ip and bypass the
    // /api/track rate limiter. 1 hop trusts only what nginx itself appended.
    trustProxy: 1,
    logger,
  });

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });

  // Default CORS policy: only the dashboard's own origin may send
  // credentialed requests. Tenant-registered domains have no business
  // reading a logged-in user's session. /api/track overrides this
  // per-route, since it's called from arbitrary customer sites
  // and carries no cookies.
  app.register(cors, {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
    prefix: "/",
  });

  app.register(authRoutes);
  app.register(tenantRoutes);
  app.register(statsRoutes);
  app.register(shareLinksRoutes);

  app.withTypeProvider<ZodTypeProvider>().register(trackRoutes);

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
