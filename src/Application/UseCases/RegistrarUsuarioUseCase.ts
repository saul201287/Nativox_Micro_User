import { Usuario } from "../../Domain/Aggregates/Usuario";
import { UsuarioRegistradoEvent } from "../../Domain/Events/DomainEvents";
import {
  UsuarioRepository,
  EventPublisher,
} from "../../Domain/Repositories/Ports";
import { Email } from "../../Domain/ValueObjects/Email";
import { IdiomaPreferidoVO } from "../../Domain/ValueObjects/IdiomaPreferido";
import { Phone } from "../../Domain/ValueObjects/Phone";
import { RegistrarUsuarioDTO } from "../DTOs/DTOs";
import * as bcrypt from "bcrypt";
import {
  ServicioDeNotificaciones,
  TipoNotificacion,
} from "../../Domain/Services/ServicioDeNotificaciones";

export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly servicioNotificaciones: ServicioDeNotificaciones
  ) {}

  async execute(dto: RegistrarUsuarioDTO): Promise<{ id: string }> {
    try {
      const email = new Email(dto.email);
      const phone = new Phone(dto.phone, true);

      const usuarioExistente = await this.usuarioRepository.findByEmail(email);

      if (usuarioExistente) {
        throw new Error("El email ya está registrado");
      }

      const usuarioId = crypto.randomUUID();
      const idiomaPreferido = new IdiomaPreferidoVO(dto.idiomaPreferido);
      const contrasenaHash = await bcrypt.hash(
        dto.contrasena,
        Number(process.env.SECRET_JUMP)
      );

      const usuario = new Usuario(
        usuarioId,
        dto.nombre,
        email,
        phone,
        contrasenaHash,
        idiomaPreferido,
        new Date(),
        dto.fcmToken
      );

      await this.usuarioRepository.save(usuario);

      const event = new UsuarioRegistradoEvent(
        usuarioId,
        usuario.email.getValue(),
        usuario.nombre,
        dto.fcmToken
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
