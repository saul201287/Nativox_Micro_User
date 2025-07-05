import express from "express";
import { usuarioController } from "../../Dependencies";
import { authMiddleware } from "../../../Shared/Middleware/auth-middleware";

export const userRouter = express.Router();

userRouter.post("/registrar", (req, res) =>
  usuarioController.registrar(req, res)
);
userRouter.post("/login", (req, res) => usuarioController.login(req, res));

userRouter.put("/:usuarioId/progreso", (req, res, next) => {
  authMiddleware(req, res, next),
    usuarioController.actualizarProgreso(req, res);
});
