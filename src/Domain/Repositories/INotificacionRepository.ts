import { Notificacion } from "../Entities/Notificacion";

export interface INotificacionRepository {
  /**
   * Obtiene todas las notificaciones de un usuario por su ID
   * @param usuarioId ID del usuario
   * @returns Promesa que resuelve a un arreglo de Notificacion
   */
  getNotificacionesByUsuarioId(usuarioId: string): Promise<Notificacion[]>;

  /**
   * Guarda una notificación
   * @param notificacion Notificación a guardar
   */
  save(notificacion: Notificacion): Promise<void>;

  /**
   * Actualiza una notificación existente
   * @param notificacion Notificación a actualizar
   */
  update(notificacion: Notificacion): Promise<void>;

  /**
   * Busca una notificación por su ID
   * @param id ID de la notificación
   * @returns Promesa que resuelve a la Notificación o null si no se encuentra
   */
  findById(id: string): Promise<Notificacion | null>;
}
