import Fastify from "fastify";
import * as dotenv from "dotenv";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import path from "path";

import { trackRoutes } from "./routes/track";
import { authRoutes } from "./routes/auth";
import fastifyCookie from "@fastify/cookie";
import { statsRoutes } from "./routes/stats";
import { tenantRoutes } from "./routes/tenants";
import { shareLinksRoutes } from "./routes/share-links";
import { refreshOrigins } from "./lib/cors-cache";

dotenv.config();

const app = Fastify({
  // Exactly one reverse proxy (nginx) sits in front of this process on the
  // same host. trustProxy: true would trust the entire client-supplied
  // X-Forwarded-For chain, letting a client spoof request.ip and bypass the
  // /api/track rate limiter. 1 hop trusts only what nginx itself appended.
  trustProxy: 1,
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
});

// Default CORS policy: only the dashboard's own origin may send
// credentialed requests. Tenant-registered domains have no business
// reading a logged-in user's session. /api/track overrides this
// per-route below, since it's called from arbitrary customer sites
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

const port = Number(process.env.PORT) || 3000;

refreshOrigins()
  .then(() => {
    app.listen({ port, host: "0.0.0.0" }, (err) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    app.log.error(err, "Failed to initialize CORS origins, starting server anyway");
    app.listen({ port, host: "0.0.0.0" }, (listenErr) => {
      if (listenErr) {
        app.log.error(listenErr);
        process.exit(1);
      }
    });
  });
