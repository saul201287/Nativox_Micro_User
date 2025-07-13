import { app } from "./Cmd/server";
import helmet from "helmet";
import { Signale } from "signale";
import { database } from "./Config/db/connect";
import { eventPublisher } from "./Infraestructure/Dependencies";
import { startSagaConsumer } from "./Infraestructure/kafka/consumer";
import { sanitizeInputs } from "./Shared/middleware/sanitize";

async function bootstrap() {
  try {
    await database.connect();
    const dataSource = database.getDataSource();

    app.use(helmet.hidePoweredBy());
    app.use(
      helmet.hsts({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      })
    );

    app.use(sanitizeInputs);

    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        service: "usuario-service",
        database: dataSource.isInitialized ? "connected" : "disconnected",
      });
    });

    await startSagaConsumer();

    const options = {
      secrets: ["([0-9]{4}-?)+"],
    };

    const logger = new Signale(options);
    const port = process.env.PORT ?? 3000;
    
    const server = app.listen(port, () => {
      logger.success(`Server listening on port: ${port}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await eventPublisher.disconnect();
          await database.disconnect();
          console.log("Servidor cerrado exitosamente");
          process.exit(0);
        } catch (error) {
          console.error("Error durante el shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

/*
//HTTPS
import { app } from "./Cmd/server";
import helmet from "helmet";
import { Signale } from "signale";
import { database } from "./Config/db/connect";
import { eventPublisher } from "./Infraestructure/Dependencies";
import { startSagaConsumer } from "./Infraestructure/kafka/consumer";
import { sanitizeInputs } from "./Shared/Middleware/sanitize";

import https from "https";
import fs from "fs";

async function bootstrap() {
  try {
    await database.connect();
    const dataSource = database.getDataSource();

    app.use(helmet.hidePoweredBy());
    app.use(
      helmet.hsts({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      })
    );

    app.use(sanitizeInputs);

    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        service: "usuario-service",
        database: dataSource.isInitialized ? "connected" : "disconnected",
      });
    });

    await startSagaConsumer();

    const options = {
      secrets: ["([0-9]{4}-?)+"],
    };

    const logger = new Signale(options);
    const port = process.env.PORT ?? 3000;

    const httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || "/ruta/a/su/clave-privada.key"),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || "/ruta/a/su/certificado.crt"),
    };

    const server = https.createServer(httpsOptions, app).listen(port, () => {
      logger.success(`Servidor HTTPS escuchando en el puerto: ${port}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} recibido. Cerrando servidor...`);
      server.close(async () => {
        try {
          await eventPublisher.disconnect();
          await database.disconnect();
          console.log("Servidor cerrado exitosamente");
          process.exit(0);
        } catch (error) {
          console.error("Error durante el shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Error durante bootstrap:", error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
*/