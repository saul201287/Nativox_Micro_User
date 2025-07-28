import { Usuario } from "../../Domain/Aggregates/Usuario";
import { UsuarioRegistradoEvent } from "../../Domain/Events/DomainEvents";
import {
  UsuarioRepository,
  EventPublisher,
} from "../../Domain/Repositories/Ports";
import { Email } from "../../Domain/ValueObjects/Email";
import { IdiomaPreferidoVO } from "../../Domain/ValueObjects/IdiomaPreferido";
import { Phone } from "../../Domain/ValueObjects/Phone";
import { RegistrarUsuarioFirebaseDTO } from "../DTOs/DTOs";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "../../Domain/Services/ServicioDeNotificaciones";
import crypto from "crypto";

export class RegistrarUsuarioFirebaseUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly servicioNotificaciones: ServicioDeNotificaciones
  ) {}

  async execute(dto: RegistrarUsuarioFirebaseDTO): Promise<{ id: string }> {
    try {
        console.log(dto);
        
      const email = new Email(dto.email);
      
      const usuarioExistente = await this.usuarioRepository.findByEmail(email);
      const usuarioExistenteFirebase = await this.usuarioRepository.findByFirebaseUid(dto.firebaseUid);

      if (usuarioExistente) {
        throw new Error("El email ya está registrado");
      }

      if (usuarioExistenteFirebase) {
        throw new Error("El usuario de Firebase ya está registrado");
      }

      const usuarioId = crypto.randomUUID();
      const idiomaPreferido = new IdiomaPreferidoVO(dto.idiomaPreferido);
      
      let phone: Phone | undefined;
      if (dto.phoneNumber ) {
        phone = new Phone(dto.phoneNumber, true);
      }
      
      const usuario = new Usuario(
        usuarioId,
        dto.nombre,
        dto.apellido,
        email,
        phone === undefined ? new Phone("", true) : phone,
        undefined,
        idiomaPreferido,
        new Date(),
        dto.fcmToken,
        {
          firebaseUid: dto.firebaseUid,
          firebaseDisplayName: dto.displayName,
          firebasePhoneNumber: dto.phoneNumber,
          emailVerified: dto.emailVerified || false,
          tipoAutenticacion: "firebase"
        }
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

      return { id: usuarioId };
    } catch (error) {
      console.log(error);
      throw new Error("Error: " + error);
    }
  }
} 