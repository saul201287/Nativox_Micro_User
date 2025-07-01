import express from "express";
import { usuarioController } from "../../Dependencies";

export const userRouter = express.Router();

userRouter.post("/registrar", (req, res) =>
  usuarioController.registrar(req, res)
);
userRouter.post("/login", (req, res) =>
  usuarioController.login(req, res)
);
userRouter.put("/:usuarioId/progreso", (req, res) =>
  usuarioController.actualizarProgreso(req, res)
);
