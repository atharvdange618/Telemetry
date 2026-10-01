import * as dotenv from "dotenv";
import { buildApp } from "./app";
import { startIngestionAlerts } from "./lib/ingestion-alert";

dotenv.config();

const app = buildApp({
  transport: {
    target: "pino-pretty",
  },
});

const port = Number(process.env.PORT) || 3000;

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  startIngestionAlerts(app.log);
});
