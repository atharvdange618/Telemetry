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
import { fileURLToPath } from "url";

import { trackRoutes } from "./routes/track";
import { authRoutes } from "./routes/auth";
import fastifyCookie from "@fastify/cookie";
import { statsRoutes } from "./routes/stats";
import { tenantRoutes } from "./routes/tenants";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
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
  origin: true,
  credentials: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/",
});

app.setNotFoundHandler(async (request, reply) => {
  if (request.url.startsWith("/api/") || request.url.startsWith("/login")) {
    reply.code(404).send({ error: "Not found" });
    return;
  }
  reply.code(404).send({ error: "Not found" });
});

app.register(authRoutes);
app.register(tenantRoutes);
app.register(statsRoutes);

app.withTypeProvider<ZodTypeProvider>().register(trackRoutes);

app.get("/health", async () => {
  return { status: "ok" };
});

const port = Number(process.env.PORT) || 3000;

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
