import { Kafka } from "kafkajs";
import * as dotenv from "dotenv";
import { database } from "../Config/db/connect";
import { ActualizarProgresoUseCase } from "../Application/UseCases/ActualizarProgresoUseCase";
import { LoginUseCase } from "../Application/UseCases/LoginUseCase";
import { RegistrarUsuarioUseCase } from "../Application/UseCases/RegistrarUsuarioUseCase";
import { RegistrarUsuarioFirebaseUseCase } from "../Application/UseCases/RegistrarUsuarioFirebaseUseCase";
import { LoginFirebaseUseCase } from "../Application/UseCases/LoginFirebaseUseCase";
import { SolicitarRecuperacionContrasenaUseCase } from "../Application/UseCases/SolicitarRecuperacionContrasenaUseCase";
import { RestablecerContrasenaUseCase } from "../Application/UseCases/RestablecerContrasenaUseCase";
import { ActualizarFcmTokenUseCase } from "../Application/UseCases/ActualizarFcmTokenUseCase";
import { ServicioDeAutenticacion } from "../Domain/Services/ServicesAuth";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "../Domain/Services/ServicioDeNotificaciones";
import { TypeORMUsuarioRepository } from "../Infraestructure/Adapters/TypeORM/UserRepository";
import { UsuarioController } from "../Infraestructure/HTTP/Controllers/UsuarioController";
import { FirebaseAuthController } from "../Infraestructure/HTTP/Controllers/FirebaseAuthController";
import { KafkaEventPublisher } from "../Infraestructure/Messaging/KafkaEventPublisher";
import {
  PushNotificationStrategy,
  EmailNotificationStrategy,
} from "../Infraestructure/Notifications/PushNotificationStrategy";
import { CrearComentarioUseCase } from "../Application/UseCases/CrearComentarioUseCase";
import { ObtenerComentariosUseCase } from "../Application/UseCases/ObtenerComentariosUseCase";
import { ObtenerNotificacionesUseCase } from "../Application/UseCases/ObtenerNotificacionesUseCase";
import { MarcarNotificacionLeidaUseCase } from "../Application/UseCases/MarcarNotificacionLeidaUseCase";
import { TypeORMNotificacionRepository } from "../Infraestructure/Adapters/TypeORM/NotificacionRepository";
import { NotificacionController } from "../Infraestructure/HTTP/Controllers/NotificacionController";



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
const notificacionRepository = new TypeORMNotificacionRepository(dataSource);

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

const registrarUsuarioFirebaseUseCase = new RegistrarUsuarioFirebaseUseCase(
  usuarioRepository,
  eventPublisher,
  servicioNotificaciones
);

const loginUseCase = new LoginUseCase(servicioAutenticacion, usuarioRepository);

const loginFirebaseUseCase = new LoginFirebaseUseCase(usuarioRepository);

const actualizarProgresoUseCase = new ActualizarProgresoUseCase(
  usuarioRepository,
  eventPublisher
);

const solicitarRecuperacionContrasenaUseCase = new SolicitarRecuperacionContrasenaUseCase(
  usuarioRepository,
  servicioNotificaciones
);

const restablecerContrasenaUseCase = new RestablecerContrasenaUseCase(
  usuarioRepository,
  servicioNotificaciones
);

const actualizarFcmTokenUseCase = new ActualizarFcmTokenUseCase(
  usuarioRepository,
  eventPublisher,
  servicioNotificaciones
);

const crearComentarioUseCase = new CrearComentarioUseCase(usuarioRepository);
const obtenerComentariosUseCase = new ObtenerComentariosUseCase(usuarioRepository);
const obtenerNotificacionesUseCase = new ObtenerNotificacionesUseCase(notificacionRepository);
const marcarNotificacionLeidaUseCase = new MarcarNotificacionLeidaUseCase(notificacionRepository);

export const usuarioController = new UsuarioController(
  registrarUsuarioUseCase,
  loginUseCase,
  actualizarProgresoUseCase,
  solicitarRecuperacionContrasenaUseCase,
  restablecerContrasenaUseCase,
  actualizarFcmTokenUseCase,
  crearComentarioUseCase,
  obtenerComentariosUseCase
);

export const notificacionController = new NotificacionController(
  obtenerNotificacionesUseCase,
  marcarNotificacionLeidaUseCase
);

export const firebaseAuthController = new FirebaseAuthController(
  registrarUsuarioFirebaseUseCase,
  loginFirebaseUseCase
);
