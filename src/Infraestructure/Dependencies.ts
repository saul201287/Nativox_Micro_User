import { Kafka } from "kafkajs";
import * as dotenv from "dotenv";
import { database } from "../Config/db/connet";
import { ActualizarProgresoUseCase } from "../Application/UseCases/ActualizarProgresoUseCase";
import { LoginUseCase } from "../Application/UseCases/LoginUseCase";
import { RegistrarUsuarioUseCase } from "../Application/UseCases/RegistrarUsuarioUseCase";
import { ServicioDeAutenticacion } from "../Domain/Services/ServicioDeAutenticacion";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "../Domain/Services/ServicioDeNotificaciones";
import { TypeORMUsuarioRepository } from "../Infraestructure/Adapters/TypeORM/UserRepository";
import { UsuarioController } from "../Infraestructure/HTTP/Controllers/UsuarioController";
import { KafkaEventPublisher } from "../Infraestructure/Messaging/KafkaEventPublisher";
import {
  PushNotificationStrategy,
  EmailNotificationStrategy,
} from "../Infraestructure/Notifications/PushNotificationStrategy";



dotenv.config();
const dataSource = database.getDataSource();

if (!process.env.CLIENT_ID || !process.env.BROKER) {
  throw new Error("Credenciales de Kafka nulas");
}

const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: [process.env.BROKER],
});

const usuarioRepository = new TypeORMUsuarioRepository(dataSource);
export const eventPublisher = new KafkaEventPublisher(kafka);
eventPublisher.connect();

const servicioAutenticacion = new ServicioDeAutenticacion(
  usuarioRepository,
  eventPublisher
);

const servicioNotificaciones = new ServicioDeNotificaciones(
  usuarioRepository,
  eventPublisher
);

servicioNotificaciones.registrarStrategy(
  TipoNotificacion.PUSH,
  new PushNotificationStrategy()
);
servicioNotificaciones.registrarStrategy(
  TipoNotificacion.EMAIL,
  new EmailNotificationStrategy()
);

const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(
  usuarioRepository,
  eventPublisher,
  servicioNotificaciones
);
const loginUseCase = new LoginUseCase(servicioAutenticacion);
const actualizarProgresoUseCase = new ActualizarProgresoUseCase(
  usuarioRepository,
  eventPublisher
);

export const usuarioController = new UsuarioController(
  registrarUsuarioUseCase,
  loginUseCase,
  actualizarProgresoUseCase
);
