import { Request, Response } from "express";
import { ObtenerNotificacionesUseCase } from "../../../Application/UseCases/ObtenerNotificacionesUseCase";

export class NotificacionController {
  constructor(
    private readonly obtenerNotificacionesUseCase: ObtenerNotificacionesUseCase
  ) {}

  /**
   * Obtiene todas las notificaciones de un usuario
   * @param req Request de Express
   * @param res Response de Express
   */
  async obtenerPorUsuarioId(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;

      if (!usuarioId) {
        res.status(400).json({ 
          success: false, 
          message: "El ID de usuario es requerido" 
        });
        return;
      }

      const notificaciones = await this.obtenerNotificacionesUseCase.execute(usuarioId);
      
      res.status(200).json({
        success: true,
        data: notificaciones.map(notif => ({
          id: notif.id,
          usuarioId: notif.usuarioId,
          mensaje: notif.mensaje,
          leido: notif.leido,
          fechaEnvio: notif.fechaEnvio
        }))
      });
    } catch (error) {
      console.error("Error en NotificacionController.obtenerPorUsuarioId:", error);
      
      let statusCode = 500;
      let message = "Error al obtener las notificaciones del usuario";
      
      if (error instanceof Error) {
        statusCode = error.message.includes("no encontrado") ? 404 : 500;
        message = statusCode === 404 ? error.message : message;
      }
      
      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }

  // Aquí podrías agregar más métodos relacionados con notificaciones en el futuro
  // como marcar como leída, eliminar, etc.
}
