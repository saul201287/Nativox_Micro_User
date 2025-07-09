import { UsuarioRepository } from "../../Domain/Repositories/Ports";
import { Email } from "../../Domain/ValueObjects/Email";
import { SolicitarRecuperacionContrasenaDTO } from "../DTOs/DTOs";
import { ServicioDeNotificaciones, TipoNotificacion } from "../../Domain/Services/ServicioDeNotificaciones";
import * as crypto from "crypto";

export class SolicitarRecuperacionContrasenaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly servicioNotificaciones: ServicioDeNotificaciones
  ) {}

  async execute(dto: SolicitarRecuperacionContrasenaDTO): Promise<{ mensaje: string }> {
    try {
      const email = new Email(dto.email);
      const usuario = await this.usuarioRepository.findByEmail(email);

      if (!usuario) {
        return { mensaje: "Si el email existe, recibirás un enlace para restablecer tu contraseña" };
      }

      const token = crypto.randomBytes(32).toString('hex');
      const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

      usuario.agregarTokenRecuperacion(token, fechaExpiracion);
      await this.usuarioRepository.save(usuario);

      const mensaje = `Hola ${usuario.nombre}, 
      Has solicitado restablecer tu contraseña en Nativox.
      Para continuar con el proceso, haz clic en el siguiente enlace:
      ${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/restablecer-contrasena?token=${token}
      Este enlace expirará en 1 hora por seguridad.
     Si no solicitaste este cambio, puedes ignorar este mensaje.
     Saludos,
     El equipo de Nativox`;

      await this.servicioNotificaciones.enviarNotificacion(
        usuario.id,
        mensaje,
        TipoNotificacion.EMAIL
      );

      return { mensaje: "Si el email existe, recibirás un enlace para restablecer tu contraseña" };
    } catch (error) {
      console.error("Error en solicitar recuperación de contraseña:", error);
      throw new Error("Error al procesar la solicitud de recuperación de contraseña");
    }
  }
} 