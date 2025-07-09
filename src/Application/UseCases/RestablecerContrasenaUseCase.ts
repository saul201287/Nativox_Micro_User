import { UsuarioRepository } from "../../Domain/Repositories/Ports";
import { RestablecerContrasenaDTO } from "../DTOs/DTOs";
import { ServicioDeNotificaciones, TipoNotificacion } from "../../Domain/Services/ServicioDeNotificaciones";

export class RestablecerContrasenaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly servicioNotificaciones: ServicioDeNotificaciones
  ) {}

  async execute(dto: RestablecerContrasenaDTO): Promise<{ mensaje: string }> {
    try {
      
      const usuario = await this.usuarioRepository.findByTokenRecuperacion(dto.token);

      if (!usuario) {
        throw new Error("Token de recuperación inválido o expirado");
      }

      if (!usuario.esTokenRecuperacionValido()) {
        throw new Error("Token de recuperación expirado");
      }

      await usuario.cambiarContrasena(dto.nuevaContrasena);
      
      usuario.limpiarTokenRecuperacion();
      
      await this.usuarioRepository.save(usuario);

      const mensaje = `Hola ${usuario.nombre},
     Tu contraseña ha sido restablecida exitosamente.
     Si no realizaste este cambio, contacta inmediatamente con nuestro equipo de soporte.

    Saludos,
    El equipo de Nativox`;

      await this.servicioNotificaciones.enviarNotificacion(
        usuario.id,
        mensaje,
        TipoNotificacion.EMAIL
      );

      return { mensaje: "Contraseña restablecida exitosamente" };
    } catch (error) {
      console.error("Error en restablecer contraseña:", error);
      throw error;
    }
  }
} 