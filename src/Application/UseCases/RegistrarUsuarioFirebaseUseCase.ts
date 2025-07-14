import { Usuario } from "../../Domain/Aggregates/Usuario";
import { UsuarioRegistradoEvent } from "../../Domain/Events/DomainEvents";
import {
  UsuarioRepository,
  EventPublisher,
} from "../../Domain/Repositories/Ports";
import { Email } from "../../Domain/ValueObjects/Email";
import { IdiomaPreferidoVO } from "../../Domain/ValueObjects/IdiomaPreferido";
import { Phone } from "../../Domain/ValueObjects/Phone";
import { RegistrarUsuarioFirebaseDTO, ResultadoLoginFirebaseDTO } from "../DTOs/DTOs";
import { FirebaseAuthService } from "../../Domain/Services/FirebaseAuthService";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "../../Domain/Services/ServicioDeNotificaciones";
import crypto from "crypto";

export class RegistrarUsuarioFirebaseUseCase {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly servicioNotificaciones: ServicioDeNotificaciones
  ) {}

  async execute(dto: RegistrarUsuarioFirebaseDTO): Promise<ResultadoLoginFirebaseDTO> {
    try {
      const email = new Email(dto.email);
      const phone = dto.phoneNumber ? new Phone(dto.phoneNumber, true) : undefined;

      const usuarioExistente = await this.usuarioRepository.findByEmail(email);
      if (usuarioExistente) {
        throw new Error("El email ya está registrado en nuestra base de datos");
      }

      const displayName = `${dto.nombre} ${dto.apellido}`;
      const firebaseResult = await this.firebaseAuthService.registrarUsuario(
        dto.email,
        dto.password,
        displayName,
        dto.phoneNumber
      );

      const usuarioId = crypto.randomUUID();
      const idiomaPreferido = new IdiomaPreferidoVO(dto.idiomaPreferido);

      const usuario = new Usuario(
        usuarioId,
        dto.nombre,
        dto.apellido,
        email,
        phone || new Phone("", false),
        "", 
        idiomaPreferido,
        new Date(),
        dto.fcmToken || ""
      );

      await this.usuarioRepository.save(usuario);

      const event = new UsuarioRegistradoEvent(
        usuarioId,
        usuario.email.getValue(),
        usuario.nombre,
        dto.fcmToken || ""
      );
      await this.eventPublisher.publish(event);

      const mensaje = `¡Gracias por unirte a Nativox!
      Estamos muy emocionados de que formes parte de esta comunidad dedicada a preservar y aprender nuestras lenguas originarias. Con Nativox, podrás explorar el tzeltal y el zapoteco a través de lecciones interactivas, cuentos, minijuegos y herramientas con inteligencia artificial que te ayudarán a mejorar tu pronunciación, comprensión y vocabulario.
      Te invitamos a comenzar tu primera lección y descubrir el mundo de las lenguas indígenas como nunca antes.
      ¡Bienvenido a la nueva generación del aprendizaje cultural!`;
      
      await this.servicioNotificaciones.enviarNotificacion(
        usuarioId,
        mensaje,
        TipoNotificacion.EMAIL
      );

      await this.firebaseAuthService.enviarEmailVerificacion(firebaseResult.user.uid);

      return {
        token: firebaseResult.token,
        expiresAt: firebaseResult.expiresAt,
        user: firebaseResult.user,
      };
    } catch (error) {
      console.error("Error en registro Firebase:", error);
      throw new Error(`Error al registrar usuario: ${error}`);
    }
  }
} 