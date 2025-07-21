import express from "express";
import { usuarioController } from "../../Dependencies";
import { authMiddleware } from "../../../Shared/middleware/auth-middleware";

export const userRouter = express.Router();

userRouter.post("/registrar", (req, res) =>
  usuarioController.registrar(req, res)
);
userRouter.post("/login", (req, res) => 
  usuarioController.login(req, res)
);

userRouter.put("/:usuarioId/progreso", authMiddleware, (req, res) => {
  usuarioController.actualizarProgreso(req, res);
});

userRouter.post("/solicitar-recuperacion", (req, res) =>
  usuarioController.solicitarRecuperacionContrasena(req, res)
);

userRouter.post("/restablecer-contrasena", (req, res) =>
  usuarioController.restablecerContrasena(req, res)
);

userRouter.put("/:usuarioId/fcm-token", authMiddleware, (req, res) => {
  usuarioController.actualizarFcmToken(req, res);
});

userRouter.post("/comentarios", authMiddleware, (req, res) =>
  usuarioController.crearComentario(req, res)
);

userRouter.get("/comentarios", authMiddleware, (req, res) =>
  usuarioController.obtenerComentarios(req, res)
);
