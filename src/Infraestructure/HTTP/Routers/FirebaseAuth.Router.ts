import express from "express";
import { firebaseAuthController } from "../../Dependencies"; // Asume que tienes esto en tu archivo de dependencias
import { authMiddleware } from "../../../Shared/middleware/auth-middleware";

export const firebaseAuthRouter = express.Router();

firebaseAuthRouter.post("/registrar", (req, res) =>{
  console.log("body2", req.body);
  
  firebaseAuthController.registrarUsuario(req, res)}
);

firebaseAuthRouter.post("/login", (req, res) =>
  firebaseAuthController.login(req, res)
);

firebaseAuthRouter.get("/verificar-token", authMiddleware, (req, res) =>
  firebaseAuthController.verificarToken(req, res)
);

firebaseAuthRouter.get("/perfil", authMiddleware, (req, res) =>
  firebaseAuthController.obtenerPerfil(req, res)
);
