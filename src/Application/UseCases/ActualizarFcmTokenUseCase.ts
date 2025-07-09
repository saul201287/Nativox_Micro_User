import { UpdateFcmTokenEvent } from "../../Domain/Events/DomainEvents";
import { EventPublisher, UsuarioRepository } from "../../Domain/Repositories/Ports";
import { ServicioDeNotificaciones } from "../../Domain/Services/ServicioDeNotificaciones";
import { ActualizarFcmTokenDTO } from "../DTOs/DTOs";

export class ActualizarFcmTokenUseCase {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly servicioNotificaciones: ServicioDeNotificaciones
  ) {}

  async execute(dto: ActualizarFcmTokenDTO): Promise<{ mensaje: string }> {
    try {
      const usuario = await this.usuarioRepository.findById(dto.usuarioId);

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      usuario.establecerFcmToken(dto.fcmToken);
      await this.usuarioRepository.save(usuario);
      const event = new UpdateFcmTokenEvent(
        dto.usuarioId,
        dto.fcmToken
      );
      await this.eventPublisher.publish(event);
      return { mensaje: "Token FCM actualizado exitosamente" };
    } catch (error) {
      console.error("Error al actualizar FCM token:", error);
      throw error;
    }
  }
} 