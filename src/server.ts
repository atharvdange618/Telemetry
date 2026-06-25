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
import { refreshOrigins, isOriginAllowed } from "./lib/cors-cache";

dotenv.config();

const app = Fastify({
  trustProxy: true,
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
});

app.register(cors, {
  origin: (origin, cb) => {
    cb(null, isOriginAllowed(origin));
  },
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
