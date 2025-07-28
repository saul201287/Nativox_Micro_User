import express from "express";
import { notificacionController } from "../../Dependencies";
import { authMiddleware } from "../../../Shared/middleware/auth-middleware";

export const notificacionRouter = express.Router();

/**
 * @swagger
 * /api/notificaciones/usuario/{usuarioId}:
 *   get:
 *     summary: Obtiene todas las notificaciones de un usuario
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notificacion'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
notificacionRouter.get(
  "/usuario/:usuarioId",
  authMiddleware,
  (req, res) => notificacionController.obtenerPorUsuarioId(req, res)
);

/**
 * @swagger
 * /api/notificaciones/marcar-leida/{notificacionId}:
 *   put:
 *     summary: Marca una notificación como leída
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: notificacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación a marcar como leída
 *     responses:
 *       200:
 *         description: Notificación marcada como leída correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notificación marcada como leída correctamente"
 *       400:
 *         description: Error en la solicitud (falta ID de notificación)
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
notificacionRouter.put(
  "/marcar-leida/:notificacionId",
  authMiddleware,
  (req, res) => notificacionController.marcarComoLeida(req, res)
);

export default notificacionRouter;
