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
    private usuarioRepository: UsuarioRepository,
    private eventPublisher: EventPublisher,
    private servicioNotificaciones: ServicioDeNotificaciones
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
        idiomaPreferido
      );

      const userCreate = await this.usuarioRepository.save(usuario);

      console.log(userCreate);

      const event = new UsuarioRegistradoEvent(
        usuarioId,
        usuario.email.getValue(),
        usuario.nombre
      );
      await this.eventPublisher.publish(event);

      await this.servicioNotificaciones.enviarNotificacion(
        usuarioId,
        "¡Bienvenido a la plataforma!",
        TipoNotificacion.EMAIL
      );

      return { id: usuarioId };
    } catch (error) {
      console.log(error);

      throw new Error("Error: " + error);
    }
  }
}
