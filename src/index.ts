import express from "express";
import { Kafka } from "kafkajs";
import { ActualizarProgresoUseCase } from "./Application/UseCases/ActualizarProgresoUseCase";
import { LoginUseCase } from "./Application/UseCases/LoginUseCase";
import { RegistrarUsuarioUseCase } from "./Application/UseCases/RegistrarUsuarioUseCase";
import { ServicioDeAutenticacion } from "./Domain/Services/ServicioDeAutenticacion";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "./Domain/Services/ServicioDeNotificaciones";
import { TypeORMUsuarioRepository } from "./Infraestructure/Database/TypeORM/TypeORMUsuarioRepository";
import { UsuarioController } from "./Infraestructure/HTTP/Controllers/UsuarioController";
import { KafkaEventPublisher } from "./Infraestructure/Messaging/KafkaEventPublisher";
import {
  PushNotificationStrategy,
  EmailNotificationStrategy,
} from "./Infraestructure/Notifications/PushNotificationStrategy";
import { database } from "../src/Config/db/connet"; 

async function bootstrap() {
  try {
    // Conectar a la base de datos usando el singleton
    await database.connect();
    const dataSource = database.getDataSource();

    if (!process.env.CLIENT_ID || !process.env.BROKER) {
      throw new Error("Credenciales de Kafka nulas");
    }

    // Configurar Kafka
    const kafka = new Kafka({
      clientId: process.env.CLIENT_ID,
      brokers: [process.env.BROKER],
    });

    // Configurar dependencias
    const usuarioRepository = new TypeORMUsuarioRepository(dataSource);
    const eventPublisher = new KafkaEventPublisher(kafka);
    await eventPublisher.connect();

    // Servicios de dominio
    const servicioAutenticacion = new ServicioDeAutenticacion(
      usuarioRepository,
      eventPublisher
    );
    const servicioNotificaciones = new ServicioDeNotificaciones(
      usuarioRepository,
      eventPublisher
    );

    // Registrar strategies de notificación
    servicioNotificaciones.registrarStrategy(
      TipoNotificacion.PUSH,
      new PushNotificationStrategy()
    );
    servicioNotificaciones.registrarStrategy(
      TipoNotificacion.EMAIL,
      new EmailNotificationStrategy()
    );

    // Casos de uso
    const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(
      usuarioRepository,
      eventPublisher
    );
    const loginUseCase = new LoginUseCase(servicioAutenticacion);
    const actualizarProgresoUseCase = new ActualizarProgresoUseCase(
      usuarioRepository,
      eventPublisher
    );

    // Controller
    const usuarioController = new UsuarioController(
      registrarUsuarioUseCase,
      loginUseCase,
      actualizarProgresoUseCase
    );

    // Configurar Express
    const app = express();
    app.use(express.json());

    // Middleware de manejo de errores
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    );

    // Rutas
    app.post("/usuarios/registrar", (req, res) =>
      usuarioController.registrar(req, res)
    );
    app.post("/usuarios/login", (req, res) =>
      usuarioController.login(req, res)
    );
    app.put("/usuarios/:usuarioId/progreso", (req, res) =>
      usuarioController.actualizarProgreso(req, res)
    );

    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        service: "usuario-service",
        database: dataSource.isInitialized ? "connected" : "disconnected",
      });
    });

    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
      console.log(`Usuario Service running on port ${port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        try {
          await eventPublisher.disconnect();
          // El dataSource se maneja automáticamente por el singleton
          // pero puedes agregar lógica de cleanup si es necesario
          console.log("Server closed successfully");
          process.exit(0);
        } catch (error) {
          console.error("Error during shutdown:", error);
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
