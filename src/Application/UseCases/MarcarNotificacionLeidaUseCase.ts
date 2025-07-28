import { INotificacionRepository } from "../../Domain/Repositories/INotificacionRepository";

export class MarcarNotificacionLeidaUseCase {
  constructor(private readonly notificacionRepository: INotificacionRepository) {}

  /**
   * Marca una notificación como leída
   * @param notificacionId ID de la notificación a marcar como leída
   * @returns Promesa que resuelve a la notificación actualizada
   * @throws {Error} Si la notificación no existe o no se puede actualizar
   */
  async execute(notificacionId: string): Promise<void> {
    try {
      if (!notificacionId) {
        throw new Error("El ID de la notificación es requerido");
      }

      // Buscar la notificación existente
      const notificacion = await this.notificacionRepository.findById(notificacionId);
      
      if (!notificacion) {
        throw new Error(`No se encontró la notificación con ID: ${notificacionId}`);
      }

      // Si ya está marcada como leída, no es necesario hacer nada
      if (notificacion.leido) {
        return;
      }

      // Marcar como leída y actualizar
      notificacion.marcarComoLeido();
      await this.notificacionRepository.update(notificacion);
      
    } catch (error) {
      console.error("Error en MarcarNotificacionLeidaUseCase:", error);
      throw new Error("Error al marcar la notificación como leída");
    }
  }
}
