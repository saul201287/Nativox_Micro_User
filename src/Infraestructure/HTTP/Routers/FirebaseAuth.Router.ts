import { Router } from "express";
import { FirebaseAuthController } from "../Controllers/FirebaseAuthController";
import { FirebaseAuthMiddleware } from "../../../Shared/middleware/firebase-auth-middleware";

export class FirebaseAuthRouter {
  private router: Router;
  private controller: FirebaseAuthController;
  private authMiddleware: FirebaseAuthMiddleware;

  constructor(
    controller: FirebaseAuthController,
    authMiddleware: FirebaseAuthMiddleware
  ) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Rutas públicas
    this.router.post(
      "/register",
      FirebaseAuthController.registerValidation,
      this.controller.register
    );

    this.router.post(
      "/login",
      FirebaseAuthController.loginValidation,
      this.controller.login
    );

    this.router.post(
      "/verify-token",
      this.controller.verifyToken
    );

    this.router.post(
      "/send-password-reset",
      this.controller.sendPasswordResetEmail
    );

    // Rutas protegidas (requieren autenticación)
    this.router.get(
      "/me",
      this.authMiddleware.authenticate,
      this.controller.getCurrentUser
    );

    this.router.post(
      "/send-email-verification",
      this.authMiddleware.authenticate,
      this.controller.sendEmailVerification
    );

    // Ruta de prueba para verificar que el middleware funciona
    this.router.get(
      "/protected",
      this.authMiddleware.authenticate,
      (req, res) => {
        res.json({
          success: true,
          message: "Ruta protegida accedida correctamente",
          user: req.firebaseUser,
        });
      }
    );

    // Ruta que requiere email verificado
    this.router.get(
      "/verified-only",
      this.authMiddleware.authenticate,
      this.authMiddleware.requireEmailVerified,
      (req, res) => {
        res.json({
          success: true,
          message: "Ruta accedida con email verificado",
          user: req.firebaseUser,
        });
      }
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 