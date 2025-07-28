import { Notificacion } from "../../Domain/Entities/Notificacion";
import { INotificacionRepository } from "../../Domain/Repositories/INotificacionRepository";

export class ObtenerNotificacionesUseCase {
  constructor(private readonly notificacionRepository: INotificacionRepository) {}

  /**
   * Ejecuta el caso de uso para obtener las notificaciones de un usuario
   * @param usuarioId ID del usuario cuyas notificaciones se desean obtener
   * @returns Promesa que resuelve a un arreglo de Notificacion
   * @throws {Error} Si ocurre un error al obtener las notificaciones
   */
  async execute(usuarioId: string): Promise<Notificacion[]> {
    try {
      if (!usuarioId) {
        throw new Error("El ID de usuario es requerido");
      }

      const notificaciones = await this.notificacionRepository.getNotificacionesByUsuarioId(usuarioId);
      return notificaciones;
    } catch (error) {
      console.error("Error en ObtenerNotificacionesUseCase:", error);
      throw new Error("Error al obtener las notificaciones del usuario");
    }
  }
}
