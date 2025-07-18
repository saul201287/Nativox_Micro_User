import { Kafka } from "kafkajs";
import * as dotenv from "dotenv";
import { database } from "../Config/db/connect";
import { ActualizarProgresoUseCase } from "../Application/UseCases/ActualizarProgresoUseCase";
import { LoginUseCase } from "../Application/UseCases/LoginUseCase";
import { RegistrarUsuarioUseCase } from "../Application/UseCases/RegistrarUsuarioUseCase";
import { SolicitarRecuperacionContrasenaUseCase } from "../Application/UseCases/SolicitarRecuperacionContrasenaUseCase";
import { RestablecerContrasenaUseCase } from "../Application/UseCases/RestablecerContrasenaUseCase";
import { ActualizarFcmTokenUseCase } from "../Application/UseCases/ActualizarFcmTokenUseCase";
import { RegistrarUsuarioFirebaseUseCase } from "../Application/UseCases/RegistrarUsuarioFirebaseUseCase";
import { LoginFirebaseUseCase } from "../Application/UseCases/LoginFirebaseUseCase";
import { ServicioDeAutenticacion } from "../Domain/Services/ServicesAuth";
import { FirebaseAuthService } from "../Domain/Services/FirebaseAuthService";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "../Domain/Services/ServicioDeNotificaciones";
import { TypeORMUsuarioRepository } from "../Infraestructure/Adapters/TypeORM/UserRepository";
import { UsuarioController } from "../Infraestructure/HTTP/Controllers/UsuarioController";
import { FirebaseAuthController } from "../Infraestructure/HTTP/Controllers/FirebaseAuthController";
import { FirebaseAuthMiddleware } from "../Shared/middleware/firebase-auth-middleware";
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
const loginUseCase = new LoginUseCase(servicioAutenticacion, usuarioRepository);
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

// Firebase Authentication dependencies
const firebaseAuthService = new FirebaseAuthService();

const registrarUsuarioFirebaseUseCase = new RegistrarUsuarioFirebaseUseCase(
  firebaseAuthService,
  usuarioRepository,
  eventPublisher,
  servicioNotificaciones
);

const loginFirebaseUseCase = new LoginFirebaseUseCase(
  firebaseAuthService,
  usuarioRepository
);

const firebaseAuthMiddleware = new FirebaseAuthMiddleware(firebaseAuthService);

const firebaseAuthController = new FirebaseAuthController(
  registrarUsuarioFirebaseUseCase,
  loginFirebaseUseCase,
  firebaseAuthService
);

export const usuarioController = new UsuarioController(
  registrarUsuarioUseCase,
  loginUseCase,
  actualizarProgresoUseCase,
  solicitarRecuperacionContrasenaUseCase,
  restablecerContrasenaUseCase,
  actualizarFcmTokenUseCase
);

export { firebaseAuthController, firebaseAuthMiddleware };
